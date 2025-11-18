/*
 * Copyright 2025 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { readFileSync } from 'fs';

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import {
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
  DescribeTagsCommand,
  LoadBalancer,
} from '@aws-sdk/client-elastic-load-balancing-v2';
import { DynamicAccountConfig } from '../types';
import { AWSEntityProvider } from './AWSEntityProvider';
import { duration } from '../utils/timer';

const defaultTemplate = readFileSync(
  require.resolve('./AWSLoadBalancerProvider.default.yaml.njk'),
  'utf-8',
);

const ANNOTATION_LOAD_BALANCER_ARN = 'amazonaws.com/load-balancer-arn';
const ANNOTATION_LOAD_BALANCER_DNS_NAME =
  'amazonaws.com/load-balancer-dns-name';

const createElbLink = (region: string, loadBalancerId: string) =>
  `https://${region}.console.aws.amazon.com/ec2/home?region=${region}#LoadBalancers:loadBalancerId=${loadBalancerId};sort=loadBalancerName`;

/**
 * Provides entities from AWS Elastic Load Balancing.
 */
export class AWSLoadBalancerProvider extends AWSEntityProvider<LoadBalancer> {
  getProviderName(): string {
    return `aws-load-balancer-provider-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: LoadBalancer,
  ): Record<string, string> {
    const loadBalancerArn = resource.LoadBalancerArn!;
    const arnParts = loadBalancerArn.split(':');
    const region = arnParts[3];
    const resourceParts = arnParts[5].split('/');
    const loadBalancerId = resourceParts[3];

    const consoleLink = createElbLink(region, loadBalancerId);
    return {
      [ANNOTATION_VIEW_URL]: consoleLink,
      [ANNOTATION_LOAD_BALANCER_ARN]: loadBalancerArn,
      [ANNOTATION_LOAD_BALANCER_DNS_NAME]: resource.DNSName || 'unknown',
    };
  }

  private async getElbv2Client(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new ElasticLoadBalancingV2Client({ credentials, region: region })
      : new ElasticLoadBalancingV2Client(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();

    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;
    this.logger.info(
      `Providing load balancer resources from aws: ${accountId}`,
    );
    const lbResources: Array<Promise<Entity>> = [];

    const elbv2 = await this.getElbv2Client(dynamicAccountConfig);

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    // Get all load balancers (both ALB and NLB)
    const loadBalancers = await elbv2.send(
      new DescribeLoadBalancersCommand({}),
    );

    for (const lb of loadBalancers.LoadBalancers || []) {
      const loadBalancerArn = lb.LoadBalancerArn;
      if (!loadBalancerArn) continue;

      // Get tags for this load balancer
      const tagResponse = await elbv2.send(
        new DescribeTagsCommand({
          ResourceArns: [loadBalancerArn],
        }),
      );

      const tags = tagResponse.TagDescriptions?.[0]?.Tags || [];

      lbResources.push(
        template.render({
          data: lb,
          tags,
        }),
      );
    }

    const entities = await Promise.all(lbResources);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} Load Balancer resources from AWS: ${accountId}`,
      {
        run_duration: duration(startTimestamp),
      },
    );
  }
}
