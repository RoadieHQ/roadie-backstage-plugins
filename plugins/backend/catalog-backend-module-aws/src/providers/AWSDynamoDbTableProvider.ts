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

import { DynamoDB, paginateListTables } from '@aws-sdk/client-dynamodb';
import { Config } from '@backstage/config';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
import { AWSEntityProvider } from './AWSEntityProvider';
import { Entity } from '@backstage/catalog-model';
import { ANNOTATION_AWS_DDB_TABLE_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS DynamoDB service.
 */
export class AWSDynamoDbTableProvider extends AWSEntityProvider {
  static fromConfig(
    config: Config,
    options: {
      logger: Logger | LoggerService;
      template?: string;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
    },
  ) {
    const accountId = config.getString('accountId');
    const roleArn = config.getOptionalString('roleArn');
    const roleName = config.getString('roleName');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSDynamoDbTableProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-dynamo-db-table-${this.providerId ?? 0}`;
  }

  private async getDdb(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new DynamoDB({ credentials, region })
      : new DynamoDB(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);
    const groups = await this.getGroups();

    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );
    const ddb = await this.getDdb(dynamicAccountConfig);
    this.logger.info(`Retrieving all DynamoDB tables for account ${accountId}`);

    const paginatorConfig = {
      client: ddb,
      pageSize: 25,
    };

    const tablePages = paginateListTables(paginatorConfig, {});

    let ddbComponents: Entity[] = [];
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
              let entity: Entity | undefined = this.renderEntity(
                {
                  tags,
                  data: table,
                },
                { defaultAnnotations },
              );

              if (!entity) {
                entity = {
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
              }
              return entity;
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
