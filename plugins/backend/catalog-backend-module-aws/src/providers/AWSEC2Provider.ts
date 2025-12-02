/*
 * Copyright 2024 Larder Software Limited
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

import { EC2, Instance } from '@aws-sdk/client-ec2';
import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { ARN } from 'link2aws';
import { Environment } from 'nunjucks';

import { ANNOTATION_AWS_EC2_INSTANCE_ID } from '../annotations';
import { DynamicAccountConfig } from '../types';
import { Tag } from '../utils/tags';
import { duration } from '../utils/timer';

import defaultTemplate from './AWSEC2Provider.default.yaml.njk';
import { AWSEntityProvider } from './AWSEntityProvider';

/**
 * Provides entities from AWS Elastic Compute Cloud.
 */
export class AWSEC2Provider extends AWSEntityProvider<Instance> {
  getProviderName(): string {
    return `aws-ec2-provider-${this.providerId ?? 0}`;
  }

  protected getResourceAnnotations(
    resource: Instance,
    context: { accountId: string; region: string },
  ): Record<string, string> {
    const instanceId = resource.InstanceId!;
    const region = context.region ?? this.region;
    const accountId = context.accountId ?? this.accountId;

    // Build ARN using context values for dynamic region/account support
    const arn = `arn:aws:ec2:${region}:${accountId}:instance/${instanceId}`;
    const consoleLink = new ARN(arn).consoleLink;

    return {
      [ANNOTATION_VIEW_URL]: consoleLink,
      [ANNOTATION_AWS_EC2_INSTANCE_ID]: instanceId ?? 'unknown',
    };
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected addCustomFilters(env: Environment): void {
    // Filter: find_name_tag - Extract Name or name tag from tags array or return undefined
    env.addFilter('find_name_tag', (tags: Tag[] | undefined) => {
      if (!tags || !Array.isArray(tags)) {
        return undefined;
      }
      const nameTag = tags.find(
        tag => tag.Key === 'Name' || tag.Key === 'name',
      );
      return nameTag?.Value;
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

    this.logger.info(`Providing ec2 resources from aws: ${accountId}`);
    const ec2Resources: Array<Promise<Entity>> = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const instances = await ec2.describeInstances({
      Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
    });

    for (const {
      Instances: reservationInstances,
      ...reservation
    } of instances.Reservations || []) {
      if (reservationInstances) {
        for (const instance of reservationInstances) {
          const instanceId = instance.InstanceId;
          if (!instanceId) continue;

          // Render entity using template with reservation data as additionalData
          // Excluding Instances to avoid circular references and keep data clean
          ec2Resources.push(
            template.render({
              data: instance,
              tags: instance.Tags,
              additionalData: {
                reservation,
              },
            }),
          );
        }
      }
    }

    await this.applyMutation(ec2Resources);

    this.logger.info(
      `Finished providing ${ec2Resources.length} EC2 resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
