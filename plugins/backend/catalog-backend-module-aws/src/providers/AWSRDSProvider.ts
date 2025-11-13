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

import { readFileSync } from 'fs';

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import {
  DBInstance,
  RDS,
  paginateDescribeDBInstances,
} from '@aws-sdk/client-rds';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_RDS_INSTANCE_ARN } from '../annotations';
import { ARN } from 'link2aws';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

const defaultTemplate = readFileSync(
  require.resolve('./AWSRDSProvider.default.yaml.njs'),
  'utf-8',
);

/**
 * Provides entities from AWS Relational Database Service.
 */
export class AWSRDSProvider extends AWSEntityProvider<DBInstance> {
  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  getProviderName(): string {
    return `aws-rds-provider-${this.providerId ?? 0}`;
  }

  protected getResourceAnnotations(
    resource: DBInstance,
  ): Record<string, string> {
    const instanceArn = resource.DBInstanceArn!;
    return {
      [ANNOTATION_VIEW_URL]: new ARN(instanceArn).consoleLink,
      [ANNOTATION_AWS_RDS_INSTANCE_ARN]: instanceArn,
    };
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
    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(`Providing RDS resources from AWS: ${accountId}`);
    const rdsEntities: Array<Promise<Entity>> = [];

    const rdsClient = await this.getRdsClient(dynamicAccountConfig);
    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const paginatorConfig = {
      client: rdsClient,
      pageSize: 100,
    };

    const dbInstancePages = paginateDescribeDBInstances(paginatorConfig, {});

    for await (const instances of dbInstancePages) {
      for (const dbInstance of instances.DBInstances || []) {
        if (dbInstance.DBInstanceIdentifier && dbInstance.DBInstanceArn) {
          const tags = dbInstance.TagList || [];
          rdsEntities.push(
            template.render({
              data: dbInstance,
              tags,
            }),
          );
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: (
        await Promise.all(rdsEntities)
      ).map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${rdsEntities.length} RDS resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
