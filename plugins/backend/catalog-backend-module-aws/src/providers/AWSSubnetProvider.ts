/*
 * Copyright 2023 Larder Software Limited
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

import { EC2, Subnet } from '@aws-sdk/client-ec2';
import { DescribeSubnetsCommandOutput } from '@aws-sdk/client-ec2/dist-types/commands/DescribeSubnetsCommand';
import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { ARN } from 'link2aws';

import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

import { AWSEntityProvider } from './AWSEntityProvider';
import defaultTemplate from './AWSSubnetProvider.default.yaml.njk';

const ANNOTATION_SUBNET_ID = 'amazonaws.com/subnet-id';

/**
 * Provides entities from AWS Subnets.
 */
export class AWSSubnetProvider extends AWSEntityProvider<Subnet> {
  getProviderName(): string {
    return `aws-subnet-provider-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: Subnet,
    context: { region: string; accountId: string },
  ): Record<string, string> {
    const { region, accountId } = context;
    const subnetId = resource.SubnetId;
    const arn = `arn:aws:ec2:${region}:${accountId}:subnet/${subnetId}`;
    const consoleLink = new ARN(arn).consoleLink;
    return {
      [ANNOTATION_VIEW_URL]: consoleLink.toString(),
      [ANNOTATION_SUBNET_ID]: subnetId!,
    };
  }

  private async getEc2(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new EC2({ credentials, region: region })
      : new EC2(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();

    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(`Providing subnet resources from aws: ${accountId}`);
    const subnetResources: Array<Promise<Entity>> = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    let nextToken: string | undefined = undefined;
    do {
      const subnets: DescribeSubnetsCommandOutput = await ec2.describeSubnets({
        NextToken: nextToken,
      });

      if (!subnets) {
        break;
      }

      for (const subnet of subnets.Subnets || []) {
        const subnetId = subnet.SubnetId;
        if (!subnetId) continue;

        const tags = subnet.Tags ?? [];

        subnetResources.push(
          template.render({
            data: subnet,
            tags,
          }),
        );
      }

      nextToken = subnets.NextToken;
    } while (nextToken);

    const entities = await Promise.all(subnetResources);

    await this.applyMutation(entities);

    this.logger.info(
      `Finished providing ${entities.length} Subnet resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
