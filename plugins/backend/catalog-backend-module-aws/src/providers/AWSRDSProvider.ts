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
import { RDS, paginateDescribeDBInstances } from '@aws-sdk/client-rds';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_RDS_INSTANCE_ARN } from '../annotations';
import { ARN } from 'link2aws';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { duration } from '../utils/timer';

export type AWSRDSProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
};

/**
 * Provides entities from AWS Relational Database Service.
 */
export class AWSRDSProvider extends AWSEntityProvider {
  declare connection?: EntityProviderConnection;

  /** [1] */
  static fromConfig(
    config: Config,
    options: AWSRDSProviderOptions,
  ): AWSRDSProvider {
    const p = new AWSRDSProvider(config, options);

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
      id: 'amazon-rds-entity-provider',
      fn: p.run,
    });

    return p;
  }

  //* * [2] */
  getProviderName(): string {
    return `aws-rds-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { minutes: 5 },
      timeout: { seconds: 30 },
      id: 'amazon-rds-entity-provider',
      fn: this.run,
    });
    await this.run();
  }

  private async getRdsClient() {
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';
    const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(
      this.config,
    );
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    return new RDS({
      region,
      credentialDefaultProvider: () =>
        awsCredentialProvider.sdkCredentialProvider,
    });
  }

  /** [4] */
  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';

    const startTimestamp = process.hrtime();
    const groups = await this.getGroups();

    this.logger.info(`Providing RDS resources from AWS: ${accountId}`);
    const rdsResources: ResourceEntity[] = [];

    const rdsClient = await this.getRdsClient();

    const defaultAnnotations = this.buildDefaultAnnotations(
      this.config,
      accountId,
      region,
    );

    const paginatorConfig = {
      client: rdsClient,
      pageSize: 100,
    };

    const dbInstancePages = paginateDescribeDBInstances(paginatorConfig, {});

    for await (const instances of dbInstancePages) {
      for (const dbInstance of instances.DBInstances || []) {
        if (dbInstance.DBInstanceIdentifier && dbInstance.DBInstanceArn) {
          const instanceId = dbInstance.DBInstanceIdentifier;
          const instanceArn = dbInstance.DBInstanceArn;
          const consoleLink = new ARN(dbInstance.DBInstanceArn).consoleLink;
          const resource: ResourceEntity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations: {
                ...(await defaultAnnotations),
                [ANNOTATION_VIEW_URL]: consoleLink,
                [ANNOTATION_AWS_RDS_INSTANCE_ARN]: instanceArn,
              },
              labels: this.labelsFromTags(dbInstance.TagList),
              name: instanceId.substring(0, 62),
              title: instanceId,
              dbInstanceClass: dbInstance.DBInstanceClass,
              dbEngine: dbInstance.Engine,
              dbEngineVersion: dbInstance.EngineVersion,
              allocatedStorage: dbInstance.AllocatedStorage,
              preferredMaintenanceWindow: dbInstance.PreferredMaintenanceWindow,
              preferredBackupWindow: dbInstance.PreferredBackupWindow,
              backupRetentionPeriod: dbInstance.BackupRetentionPeriod,
              isMultiAz: dbInstance.MultiAZ,
              automaticMinorVersionUpgrade: dbInstance.AutoMinorVersionUpgrade,
              isPubliclyAccessible: dbInstance.PubliclyAccessible,
              storageType: dbInstance.StorageType,
              isPerformanceInsightsEnabled:
                dbInstance.PerformanceInsightsEnabled,
            },
            spec: {
              owner: ownerFromTags(
                dbInstance.TagList,
                this.getOwnerTag(),
                groups,
              ),
              ...relationshipsFromTags(dbInstance.TagList),
              type: 'rds-instance',
            },
          };

          rdsResources.push(resource);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: rdsResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing RDS resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
