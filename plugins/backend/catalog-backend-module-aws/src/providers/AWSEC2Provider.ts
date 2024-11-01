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

import {
  LoggerService,
  SchedulerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-plugin-api';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { ANNOTATION_VIEW_URL, ResourceEntity } from '@backstage/catalog-model';
import { EC2 } from '@aws-sdk/client-ec2';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_EC2_INSTANCE_ID } from '../annotations';
import { ARN } from 'link2aws';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { duration } from '../utils/timer';

export type AWSEC2ProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
};

/**
 * Provides entities from AWS Elastic Compute Cloud.
 */
export class AWSEC2Provider extends AWSEntityProvider {
  /** [1] */
  static fromConfig(
    config: Config,
    options: AWSEC2ProviderOptions,
  ): AWSEC2Provider {
    const p = new AWSEC2Provider(config, options);

    const defaultSchedule = {
      frequency: { minutes: 120 },
      timeout: { minutes: 60 },
      initialDelay: { seconds: 30 },
    };

    const schedule = config.has('schedule')
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('schedule'),
        )
      : defaultSchedule;

    options.scheduler.scheduleTask({
      frequency: schedule.frequency,
      timeout: schedule.timeout,
      initialDelay: schedule.initialDelay,
      id: 'amazon-ec2-entity-provider',
      fn: p.run,
    });

    return p;
  }

  /** [2] */
  getProviderName(): string {
    return `amazon-ec2-provider-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { seconds: 5 },
      timeout: { seconds: 30 },
      id: 'amazon-ec2-entity-provider',
      fn: this.run,
    });
    await this.run();
  }

  private async getEc2() {
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';
    const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(
      this.config,
    );
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    return new EC2({
      region,
      credentialDefaultProvider: () =>
        awsCredentialProvider.sdkCredentialProvider,
    });
  }

  /** [4] */
  async run(): Promise<void> {
    if (!this.connection) {
      this.logger.info('Not initialized');
      throw new Error('Not initialized');
    }
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';

    const startTimestamp = process.hrtime();
    const groups = await this.getGroups();

    this.logger.info(`Providing ec2 resources from aws: ${accountId}`);
    const ec2Resources: ResourceEntity[] = [];

    const ec2 = await this.getEc2();

    const defaultAnnotations = this.buildDefaultAnnotations(
      this.config,
      accountId,
      region,
    );

    const instances = await ec2.describeInstances({
      Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
    });

    for (const reservation of instances.Reservations || []) {
      if (reservation.Instances) {
        for (const instance of reservation.Instances) {
          const instanceId = instance.InstanceId;
          const arn = `arn:aws:ec2:${region}:${accountId}:instance/${instanceId}`;
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

    this.logger.info(
      `Finished providing ${ec2Resources.length} EC2 resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
