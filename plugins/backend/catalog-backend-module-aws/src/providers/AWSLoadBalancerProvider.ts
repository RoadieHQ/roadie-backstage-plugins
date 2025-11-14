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

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import {
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
  DescribeTagsCommand,
} from '@aws-sdk/client-elastic-load-balancing-v2';
import { DynamicAccountConfig } from '../types';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ownerFromTags, relationshipsFromTags } from '../utils/tags';
import { duration } from '../utils/timer';

const ANNOTATION_LOAD_BALANCER_ARN = 'amazonaws.com/load-balancer-arn';
const ANNOTATION_LOAD_BALANCER_DNS_NAME =
  'amazonaws.com/load-balancer-dns-name';

const createElbLink = (region: string, loadBalancerId: string) =>
  `https://${region}.console.aws.amazon.com/ec2/home?region=${region}#LoadBalancers:loadBalancerId=${loadBalancerId};sort=loadBalancerName`;

/**
 * Provides entities from AWS Elastic Load Balancing.
 */
export class AWSLoadBalancerProvider extends AWSEntityProvider {
  getProviderName(): string {
    return `aws-load-balancer-provider-${this.providerId ?? 0}`;
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

    const { accountId } = this.getParsedConfig(dynamicAccountConfig);
    const groups = await this.getGroups();

    this.logger.info(
      `Providing load balancer resources from aws: ${accountId}`,
    );
    const lbResources: Entity[] = [];

    const elbv2 = await this.getElbv2Client(dynamicAccountConfig);
    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

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
      const tagMap = tags.reduce((acc, tag) => {
        if (tag.Key && tag.Value) {
          acc[tag.Key] = tag.Value;
        }
        return acc;
      }, {} as Record<string, string>);

      const arnParts = loadBalancerArn.split(':');
      const region = arnParts[3];
      const resourceParts = arnParts[5].split('/');
      const loadBalancerId = resourceParts[3];

      const consoleLink = createElbLink(region, loadBalancerId);
      let entity: Entity | undefined = this.renderEntity(
        { data: lb, tags: tagMap },
        { defaultAnnotations },
      );
      if (!entity) {
        entity = {
          kind: 'Resource',
          apiVersion: 'backstage.io/v1beta1',
          metadata: {
            annotations: {
              ...defaultAnnotations,
              [ANNOTATION_VIEW_URL]: consoleLink,
              [ANNOTATION_LOAD_BALANCER_ARN]: loadBalancerArn,
              [ANNOTATION_LOAD_BALANCER_DNS_NAME]: lb.DNSName || 'unknown',
            },
            labels: this.labelsFromTags(tags),
            name:
              lb.LoadBalancerName ||
              loadBalancerArn.split('/').pop() ||
              'unknown',
            title: tagMap.Name || lb.LoadBalancerName,
            dnsName: lb.DNSName,
            scheme: lb.Scheme,
            vpcId: lb.VpcId,
            type: lb.Type,
            state: lb.State?.Code,
            availabilityZones: lb.AvailabilityZones?.map(
              az => az.ZoneName,
            ).join(', '),
          },
          spec: {
            owner: ownerFromTags(tags, this.getOwnerTag(), groups),
            ...relationshipsFromTags(tags),
            type: 'load-balancer',
          },
        };
      }

      lbResources.push(entity);
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: lbResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${lbResources.length} Load Balancer resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
