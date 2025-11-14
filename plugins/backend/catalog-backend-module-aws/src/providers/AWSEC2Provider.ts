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

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { EC2 } from '@aws-sdk/client-ec2';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_EC2_INSTANCE_ID } from '../annotations';
import { ARN } from 'link2aws';
import { ownerFromTags, relationshipsFromTags } from '../utils/tags';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS Elastic Compute Cloud.
 */
export class AWSEC2Provider extends AWSEntityProvider {
  getProviderName(): string {
    return `aws-ec2-provider-${this.providerId ?? 0}`;
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

    this.logger.info(`Providing ec2 resources from aws: ${accountId}`);
    const ec2Resources: Entity[] = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

    const instances = await ec2.describeInstances({
      Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
    });

    for (const reservation of instances.Reservations || []) {
      if (reservation.Instances) {
        for (const instance of reservation.Instances) {
          const instanceId = instance.InstanceId;
          const arn = `arn:aws:ec2:${region}:${accountId}:instance/${instanceId}`;
          const consoleLink = new ARN(arn).consoleLink;

          let entity: Entity | undefined = this.renderEntity(
            {
              data: instance,
            },
            { defaultAnnotations: await defaultAnnotations },
          );

          if (!entity) {
            entity = {
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              metadata: {
                annotations: {
                  ...(await defaultAnnotations),
                  [ANNOTATION_VIEW_URL]: consoleLink,
                  [ANNOTATION_AWS_EC2_INSTANCE_ID]: instanceId ?? 'unknown',
                },
                labels: this.labelsFromTags(instance.Tags),
                name:
                  instanceId ??
                  `${reservation.ReservationId}-instance-${instance.InstanceId}`,
                title:
                  instance?.Tags?.find(
                    tag => tag.Key === 'Name' || tag.Key === 'name',
                  )?.Value ?? undefined,
                instancePlatform: instance.Platform,
                instanceType: instance.InstanceType,
                monitoringState: instance.Monitoring?.State,
                instancePlacement: instance.Placement?.AvailabilityZone,
                amountOfBlockDevices: instance.BlockDeviceMappings?.length ?? 0,
                instanceCpuCores: instance.CpuOptions?.CoreCount,
                instanceCpuThreadsPerCode: instance.CpuOptions?.ThreadsPerCore,
                reservationId: reservation.ReservationId,
              },
              spec: {
                owner: ownerFromTags(instance.Tags, this.getOwnerTag(), groups),
                ...relationshipsFromTags(instance.Tags),
                type: 'ec2-instance',
              },
            };
          }

          ec2Resources.push(entity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: ec2Resources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${ec2Resources.length} EC2 resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
