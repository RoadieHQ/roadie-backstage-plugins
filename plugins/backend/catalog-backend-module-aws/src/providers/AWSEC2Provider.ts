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

import { ANNOTATION_VIEW_URL, ResourceEntity } from '@backstage/catalog-model';
import { EC2 } from '@aws-sdk/client-ec2';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_EC2_INSTANCE_ID } from '../annotations';
import { ARN } from 'link2aws';
import { labelsFromTags, ownerFromTags } from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';

/**
 * Provides entities from AWS Elastic Compute Cloud.
 */
export class AWSEC2Provider extends AWSEntityProvider {
  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
    },
  ) {
    const accountId = config.getString('accountId');
    const roleArn = config.getString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSEC2Provider(
      { accountId, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-ec2-provider-${this.accountId}-${this.providerId ?? 0}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const groups = await this.getGroups();

    this.logger.info(`Providing ec2 resources from aws: ${this.accountId}`);
    const ec2Resources: ResourceEntity[] = [];

    const credentials = this.getCredentials();
    const ec2 = new EC2({ credentials, region: this.region });

    const defaultAnnotations = this.buildDefaultAnnotations();

    const instances = await ec2.describeInstances({
      Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
    });

    for (const reservation of instances.Reservations || []) {
      if (reservation.Instances) {
        for (const instance of reservation.Instances) {
          const instanceId = instance.InstanceId;
          const arn = `arn:aws:ec2:${this.region}:${this.accountId}:instance/${instanceId}`;
          const consoleLink = new ARN(arn).consoleLink;
          const resource: ResourceEntity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations: {
                ...(await defaultAnnotations),
                [ANNOTATION_VIEW_URL]: consoleLink,
                [ANNOTATION_AWS_EC2_INSTANCE_ID]: instanceId ?? 'unknown',
              },
              labels: labelsFromTags(instance.Tags),
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
              type: 'ec2-instance',
            },
          };

          ec2Resources.push(resource);
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
  }
}
