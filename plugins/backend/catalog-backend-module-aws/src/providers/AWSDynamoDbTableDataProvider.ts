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
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { STS } from '@aws-sdk/client-sts';
import { Config } from '@backstage/config';

import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { merge } from 'lodash';
import { mapColumnsToEntityValues } from '../utils/columnMapper';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  ANNOTATION_ACCOUNT_ID,
  ANNOTATION_AWS_DDB_TABLE_ARN,
} from '../annotations';
import { ValueMapping } from '../types';

type DdbTableDataConfigOptions = {
  entityKind?: string;
  tableName: string;
  identifierColumn?: string;
  columnValueMapping?: { [key: string]: ValueMapping };
};

/**
 * Provides entities from AWS DynamoDB service.
 */
export class AWSDynamoDbTableDataProvider implements EntityProvider {
  private readonly accountId: string;
  private readonly roleArn: string;
  private readonly tableDataConfig: DdbTableDataConfigOptions;
  private readonly logger: Logger | LoggerService;

  private connection?: EntityProviderConnection;

  static fromConfig(
    config: Config,
    options: { logger: Logger | LoggerService },
  ) {
    return new AWSDynamoDbTableDataProvider(
      config.getString('accountId'),
      config.getString('roleName'),
      config.get<DdbTableDataConfigOptions>('dynamodbTableData'),
      options.logger,
    );
  }

  constructor(
    accountId: string,
    roleArn: string,
    options: DdbTableDataConfigOptions,
    logger: Logger | LoggerService,
  ) {
    this.accountId = accountId;
    this.roleArn = roleArn;
    this.tableDataConfig = options;
    this.logger = logger;
  }

  getProviderName(): string {
    return `aws-dynamo-db-table-${this.accountId}-${this.tableDataConfig.tableName}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const credentials = fromTemporaryCredentials({
      params: { RoleArn: this.roleArn },
    });

    const ddb = DynamoDBDocument.from(
      new DynamoDBClient({
        credentials,
      }),
    );
    const dynamoDBClient = new DynamoDB({ credentials });

    const account = await new STS({ credentials }).getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
      [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
      'amazon.com/dynamodb-table-name': this.tableDataConfig.tableName,
    };

    if (account.Account) {
      defaultAnnotations[ANNOTATION_ACCOUNT_ID] = account.Account;
    }

    this.logger.info(`Querying table ${this.tableDataConfig.tableName}`);

    try {
      const tableRows = await ddb.scan({
        TableName: this.tableDataConfig.tableName,
      });
      const tableDescription = await dynamoDBClient.describeTable({
        TableName: this.tableDataConfig.tableName,
      });
      const idColumn =
        this.tableDataConfig.identifierColumn ||
        tableDescription.Table?.KeySchema?.[0].AttributeName;
      if (!idColumn) {
        throw new Error(
          'No identifier column defined. Unable to construct entities.',
        );
      }
      const tableArn = tableDescription?.Table?.TableArn;
      const entities =
        tableRows.Items?.map(row => {
          const o = {
            kind: this.tableDataConfig.entityKind ?? 'Component',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations: {
                ...defaultAnnotations,
                ...(tableArn
                  ? { [ANNOTATION_AWS_DDB_TABLE_ARN]: tableArn }
                  : {}),
              },
              name: row[idColumn],
              title: row[idColumn],
            },
            spec: {
              owner: this.accountId,
              type: 'dynamo-db-table-data',
              lifecycle: 'production',
            },
          };
          const mappedColumns = this.tableDataConfig.columnValueMapping
            ? mapColumnsToEntityValues(
                this.tableDataConfig.columnValueMapping,
                row,
              )
            : {};
          return merge(o, mappedColumns);
        }) ?? [];

      await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: this.getProviderName(),
        })),
      });
    } catch (e) {
      this.logger.error((e as Error).message, e as Error);
    }
  }
}
