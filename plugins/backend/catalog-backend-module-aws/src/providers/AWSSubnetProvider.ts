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

import { EC2 } from '@aws-sdk/client-ec2';
import { DescribeSubnetsCommandOutput } from '@aws-sdk/client-ec2/dist-types/commands/DescribeSubnetsCommand';
import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { ARN } from 'link2aws';

import { DynamicAccountConfig } from '../types';
import { ownerFromTags, relationshipsFromTags } from '../utils/tags';
import { duration } from '../utils/timer';

import { AWSEntityProvider } from './AWSEntityProvider';

const ANNOTATION_SUBNET_ID = 'amazonaws.com/subnet-id';

/**
 * Provides entities from AWS Subnets.
 */
export class AWSSubnetProvider extends AWSEntityProvider {
  getProviderName(): string {
    return `aws-subnet-provider-${this.providerId ?? 0}`;
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

    const { region, accountId } = this.getParsedConfig(dynamicAccountConfig);
    const groups = await this.getGroups();

    this.logger.info(`Providing subnet resources from aws: ${accountId}`);
    const entities: Entity[] = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);
    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

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

        const arn = `arn:aws:ec2:${region}:${accountId}:subnet/${subnetId}`;
        const consoleLink = new ARN(arn).consoleLink;

        let entity = this.renderEntity(
          { data: subnet },
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
                [ANNOTATION_SUBNET_ID]: subnetId,
              },
              labels: this.labelsFromTags(subnet.Tags),
              name: subnetId,
              cidrBlock: subnet.CidrBlock,
              vpcId: subnet.VpcId,
              availabilityZone: subnet.AvailabilityZone,
              availableIpAddressCount: subnet.AvailableIpAddressCount,
              defaultForAz: subnet.DefaultForAz ? 'Yes' : 'No',
              mapPublicIpOnLaunch: subnet.MapPublicIpOnLaunch ? 'Yes' : 'No',
              state: subnet.State,
            },
            spec: {
              owner: ownerFromTags(subnet.Tags, this.getOwnerTag(), groups),
              ...relationshipsFromTags(subnet.Tags),
              type: 'subnet',
            },
          };
        }

        entities.push(entity);
      }

      nextToken = subnets.NextToken;
    } while (nextToken);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} Subnet resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
