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
import { EC2, Volume } from '@aws-sdk/client-ec2';
import { DescribeVolumesCommandOutput } from '@aws-sdk/client-ec2/dist-types/commands/DescribeVolumesCommand';
import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { Environment } from 'nunjucks';

import { DynamicAccountConfig } from '../types';
import { Tag } from '../utils/tags';
import { duration } from '../utils/timer';

import defaultTemplate from './AWSEBSVolumeProvider.default.yaml.njk';
import { AWSEntityProvider } from './AWSEntityProvider';

export const ANNOTATION_EBS_VOLUME_ID = 'amazonaws.com/ebs-volume-id';

const createEbsVolumeConsoleLink = (region: string, volumeId: string): string =>
  `https://${region}.console.aws.amazon.com/ec2/home?region=${region}#VolumeDetails:volumeId=${volumeId}`;

/**
 * Provides entities from AWS Elastic Block Store volumes.
 */
export class AWSEBSVolumeProvider extends AWSEntityProvider<Volume> {
  getProviderName(): string {
    return `aws-ebs-volume-provider-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: Volume,
    context: { accountId: string; region: string },
  ): Record<string, string> {
    const volumeId = resource.VolumeId!;
    const region = context.region ?? this.region;
    const consoleLink = createEbsVolumeConsoleLink(region, volumeId);
    return {
      [ANNOTATION_VIEW_URL]: consoleLink,
      [ANNOTATION_EBS_VOLUME_ID]: volumeId,
    };
  }

  protected addCustomFilters(env: Environment): void {
    // Filter: find_name_tag - Extract Name tag from tags array or return fallback
    env.addFilter(
      'find_name_tag',
      (tags: Tag[] | undefined, fallback: string) => {
        if (!tags || !Array.isArray(tags)) {
          return fallback;
        }
        const nameTag = tags.find(tag => tag.Key === 'Name');
        return nameTag?.Value || fallback;
      },
    );

    // Filter: instance_ids - Extract instance IDs from Attachments array
    env.addFilter('instance_ids', (attachments: Volume['Attachments']) => {
      if (!attachments || !Array.isArray(attachments)) {
        return '';
      }
      return attachments.map(a => a.InstanceId).join(', ');
    });
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

    this.logger.info(`Providing EBS volume resources from aws: ${accountId}`);
    const ebsResources: Array<Promise<Entity>> = [];

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
      const volumes: DescribeVolumesCommandOutput = await ec2.describeVolumes({
        NextToken: nextToken,
      });
      for (const volume of volumes.Volumes || []) {
        const volumeId = volume.VolumeId;
        if (!volumeId) continue;

        ebsResources.push(
          template.render({
            data: volume,
            tags: volume.Tags,
          }),
        );
      }

      nextToken = volumes.NextToken;
    } while (nextToken);

    await this.applyMutation(ebsResources);

    this.logger.info(
      `Finished providing ${ebsResources.length} EBS volume resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
