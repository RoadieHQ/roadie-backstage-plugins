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

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { EC2 } from '@aws-sdk/client-ec2';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { DynamicAccountConfig } from '../types';
import { ARN } from 'link2aws';
import { duration } from '../utils/timer';

const ANNOTATION_VPC_ID = 'amazonaws.com/vpc-id';

/**
 * Provides entities from AWS Virtual Private Clouds.
 */
export class AWSVPCProvider extends AWSEntityProvider {
  getProviderName(): string {
    return `aws-vpc-provider-${this.providerId ?? 0}`;
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

    this.logger.info(`Providing VPC resources from aws: ${accountId}`);
    const entities: Entity[] = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);
    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

    const vpcs = await ec2.describeVpcs({});

    for (const vpc of vpcs.Vpcs || []) {
      const vpcId = vpc.VpcId;
      if (!vpcId) continue;

      const arn = `arn:aws:ec2:${region}:${accountId}:vpc/${vpcId}`;
      const consoleLink = new ARN(arn).consoleLink;

      // Fetch additional VPC attributes
      const cidrBlocksResult =
        vpc.CidrBlockAssociationSet?.map(cidr => cidr.CidrBlock).join(', ') ||
        'None';

      // Get DHCP options if available
      let dhcpOptionsDetails = 'None';
      if (vpc.DhcpOptionsId) {
        try {
          const dhcpOptions = await ec2.describeDhcpOptions({
            DhcpOptionsIds: [vpc.DhcpOptionsId],
          });

          if (dhcpOptions.DhcpOptions && dhcpOptions.DhcpOptions.length > 0) {
            dhcpOptionsDetails =
              dhcpOptions.DhcpOptions[0].DhcpConfigurations?.map(
                config =>
                  `${config.Key}: ${config.Values?.map(v => v.Value).join(
                    ', ',
                  )}`,
              ).join('; ') || 'None';
          }
        } catch (error) {
          dhcpOptionsDetails = vpc.DhcpOptionsId;
        }
      }

      let entity = this.renderEntity({ data: vpc }, { defaultAnnotations });

      if (!entity) {
        entity = {
          kind: 'Resource',
          apiVersion: 'backstage.io/v1beta1',
          metadata: {
            annotations: {
              ...defaultAnnotations,
              [ANNOTATION_VIEW_URL]: consoleLink,
              [ANNOTATION_VPC_ID]: vpcId,
            },
            labels: this.labelsFromTags(vpc.Tags),
            name: vpcId,
            title: vpc.Tags?.find(tag => tag.Key === 'Name')?.Value || vpcId,
            cidrBlocks: cidrBlocksResult,
            dhcpOptions: dhcpOptionsDetails,
            isDefault: vpc.IsDefault ? 'Yes' : 'No',
            state: vpc.State,
            instanceTenancy: vpc.InstanceTenancy,
          },
          spec: {
            owner: ownerFromTags(vpc.Tags, this.getOwnerTag(), groups),
            ...relationshipsFromTags(vpc.Tags),
            type: 'vpc',
          },
        };
      }

      entities.push(entity);
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} VPC resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
