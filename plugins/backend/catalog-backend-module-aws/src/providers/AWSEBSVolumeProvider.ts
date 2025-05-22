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

import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { ANNOTATION_VIEW_URL, ResourceEntity } from '@backstage/catalog-model';
import { LoggerService } from '@backstage/backend-plugin-api';
import * as winston from 'winston';
import { EC2 } from '@aws-sdk/client-ec2';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';
import { DescribeVolumesCommandOutput } from '@aws-sdk/client-ec2/dist-types/commands/DescribeVolumesCommand';

const ANNOTATION_EBS_VOLUME_ID = 'amazonaws.com/ebs-volume-id';

const createEbsVolumeConsoleLink = (region: string, volumeId: string): string =>
  `https://${region}.console.aws.amazon.com/ec2/home?region=${region}#VolumeDetails:volumeId=${volumeId}`;

/**
 * Provides entities from AWS Elastic Block Store volumes.
 */
export class AWSEBSVolumeProvider extends AWSEntityProvider {
  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger | LoggerService;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
    },
  ) {
    const accountId = config.getString('accountId');
    const roleName = config.getString('roleName');
    const roleArn = config.getOptionalString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSEBSVolumeProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-ebs-volume-provider-${this.providerId ?? 0}`;
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

    this.logger.info(`Providing EBS volume resources from aws: ${accountId}`);
    const ebsResources: ResourceEntity[] = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);
    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

    let nextToken: string | undefined = undefined;
    do {
      const volumes: DescribeVolumesCommandOutput = await ec2.describeVolumes({
        NextToken: nextToken,
      });
      for (const volume of volumes.Volumes || []) {
        const volumeId = volume.VolumeId;
        if (!volumeId) continue;

        const arn = `arn:aws:ec2:${region}:${accountId}:volume/${volumeId}`;
        const arnParts = arn.split(':');
        const resourceParts = arnParts[5].split('/');
        const ebsVolumeId = resourceParts[3];

        const consoleLink = createEbsVolumeConsoleLink(region, ebsVolumeId);

        const resource: ResourceEntity = {
          kind: 'Resource',
          apiVersion: 'backstage.io/v1beta1',
          metadata: {
            annotations: {
              ...defaultAnnotations,
              [ANNOTATION_VIEW_URL]: consoleLink,
              [ANNOTATION_EBS_VOLUME_ID]: volumeId,
            },
            labels: this.labelsFromTags(volume.Tags),
            name: volumeId,
            title:
              volume.Tags?.find(tag => tag.Key === 'Name')?.Value || volumeId,
            size: volume.Size,
            volumeType: volume.VolumeType,
            availabilityZone: volume.AvailabilityZone,
            state: volume.State,
            encrypted: volume.Encrypted ? 'Yes' : 'No',
            attachedInstanceIds: volume.Attachments?.map(
              a => a.InstanceId,
            ).join(', '),
            createTime: volume.CreateTime?.toISOString(),
          },
          spec: {
            owner: ownerFromTags(volume.Tags, this.getOwnerTag(), groups),
            ...relationshipsFromTags(volume.Tags),
            type: 'ebs-volume',
          },
        };

        ebsResources.push(resource);
      }

      nextToken = volumes.NextToken;
    } while (nextToken);

    await this.connection.applyMutation({
      type: 'full',
      entities: ebsResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${ebsResources.length} EBS volume resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
