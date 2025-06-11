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
import { RDS, paginateDescribeDBInstances } from '@aws-sdk/client-rds';
import type { Logger } from 'winston';
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
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * Provides entities from AWS Relational Database Service.
 */
export class AWSRDSProvider extends AWSEntityProvider {
  static fromConfig(
    config: Config,
    options: {
      logger: Logger | LoggerService;
      catalogApi?: CatalogApi;
      providerId?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
      ownerTag?: string;
    },
  ) {
    const accountId = config.getString('accountId');
    const roleName = config.getString('roleName');
    const roleArn = config.getOptionalString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSRDSProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-rds-provider-${this.providerId ?? 0}`;
  }

  private async getRdsClient(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new RDS({ credentials, region })
      : new RDS(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);

    const groups = await this.getGroups();
    this.logger.info(`Providing RDS resources from AWS: ${accountId}`);
    const rdsResources: ResourceEntity[] = [];

    const rdsClient = await this.getRdsClient(dynamicAccountConfig);

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

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
