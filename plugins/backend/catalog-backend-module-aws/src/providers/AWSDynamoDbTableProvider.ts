/*
 * Copyright 2021 Larder Software Limited
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
import { DynamoDB, paginateListTables } from '@aws-sdk/client-dynamodb';
import { Config } from '@backstage/config';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ResourceEntity } from '@backstage/catalog-model';
import { ANNOTATION_AWS_DDB_TABLE_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { duration } from '../utils/timer';

export type AWSDynamoDbTableProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
};

/**
 * Provides entities from AWS DynamoDB service.
 */
export class AWSDynamoDbTableProvider extends AWSEntityProvider {
  /** [1] */
  static fromConfig(
    config: Config,
    options: AWSDynamoDbTableProviderOptions,
  ): AWSDynamoDbTableProvider {
    const p = new AWSDynamoDbTableProvider(config, options);

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
      id: 'amazon-s3-bucket-entity-provider',
      fn: p.run,
    });

    return p;
  }

  /** [2] */
  getProviderName(): string {
    return `aws-dynamo-db-table-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { seconds: 5 },
      timeout: { seconds: 30 },
      id: 'amazon-s3-bucket-entity-provider',
      fn: this.run,
    });
    await this.run();
  }

  private async getDdb() {
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';
    const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(
      this.config,
    );
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    return new DynamoDB({
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

    this.logger.info(`Retrieving all DynamoDB tables for account ${accountId}`);

    const ddb = await this.getDdb();

    const defaultAnnotations = await this.buildDefaultAnnotations(
      this.config,
      accountId,
      region,
    );

    const paginatorConfig = {
      client: ddb,
      pageSize: 25,
    };

    const tablePages = paginateListTables(paginatorConfig, {});

    let ddbComponents: ResourceEntity[] = [];
    for await (const tablePage of tablePages) {
      if (!tablePage.TableNames) {
        continue;
      }
      const newComponents = (
        await Promise.all(
          tablePage.TableNames.map(async tableName => {
            const tableDescriptionResult = await ddb.describeTable({
              TableName: tableName,
            });

            const tagsResponse = await ddb.listTagsOfResource({
              ResourceArn: tableDescriptionResult.Table?.TableArn,
            });
            const tags = tagsResponse.Tags ?? [];
            const table = tableDescriptionResult.Table;
            if (table && table.TableName && table.TableArn) {
              const component: ResourceEntity = {
                kind: 'Resource',
                apiVersion: 'backstage.io/v1beta1',
                metadata: {
                  annotations: {
                    ...defaultAnnotations,
                    [ANNOTATION_AWS_DDB_TABLE_ARN]: table.TableArn,
                  },
                  name: arnToName(table.TableArn),
                  title: table.TableName,
                  labels: this.labelsFromTags(tags),
                },
                spec: {
                  owner: ownerFromTags(tags, this.getOwnerTag(), groups),
                  ...relationshipsFromTags(tags),
                  type: 'dynamo-db-table',
                },
              };
              return component;
            }
            return null;
          }),
        )
      )
        .filter(it => it)
        .map(it => it!);
      ddbComponents = ddbComponents.concat(...newComponents);
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: ddbComponents.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${ddbComponents.length} DynamoDB tables for account ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
