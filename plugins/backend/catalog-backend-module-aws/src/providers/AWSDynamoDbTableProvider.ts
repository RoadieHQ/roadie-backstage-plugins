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
} from '@backstage/plugin-catalog-backend';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { STS } from '@aws-sdk/client-sts';
import { Config } from '@backstage/config';
import * as winston from 'winston';

/**
 * Provides entities from AWS DynamoDB service.
 */
export class AWSDynamoDbTableProvider implements EntityProvider {
  private readonly accountId: string;
  private readonly roleArn: string;
  private readonly logger: winston.Logger;

  private connection?: EntityProviderConnection;

  static fromConfig(config: Config, options: { logger: winston.Logger }) {
    return new AWSDynamoDbTableProvider(
      config.getString('accountId'),
      config.getString('roleArn'),
      options.logger,
    );
  }

  constructor(accountId: string, roleArn: string, logger: winston.Logger) {
    this.accountId = accountId;
    this.roleArn = roleArn;
    this.logger = logger;
  }

  getProviderName(): string {
    return `aws-dynamo-db-table-${this.accountId}`;
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
    const ddb = new DynamoDB({ credentials });
    const account = await new STS({ credentials }).getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
      [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
    };

    if (account.Account) {
      defaultAnnotations['amazon.com/account-id'] = account.Account;
    }

    this.logger.info(
      `Retrieving all DynamoDB tables for account ${account.Account}`,
    );
    const tables = await ddb.listTables({});

    const ddbComponents = tables.TableNames
      ? (
          await Promise.all(
            tables.TableNames.map(async tableName => {
              const tableDescriptionResult = await ddb.describeTable({
                TableName: tableName,
              });
              const table = tableDescriptionResult.Table;
              if (table && table.TableName && table.TableArn) {
                return {
                  kind: 'Component',
                  apiVersion: 'backstage.io/v1beta1',
                  metadata: {
                    annotations: {
                      ...defaultAnnotations,
                      'amazon.com/dynamo-db-table-arn': table.TableArn,
                    },
                    name: table.TableName.slice(0, 62),
                  },
                  spec: {
                    owner: this.accountId,
                    type: 'dynamo-db-table',
                    lifecycle: 'production',
                  },
                };
              }
              return null;
            }),
          )
        )
          .filter(it => it)
          .map(it => it!)
      : [];

    await this.connection.applyMutation({
      type: 'full',
      entities: ddbComponents.map(entity => ({
        entity,
        locationKey: `aws-dynamo-db-table-provider:${this.accountId}`,
      })),
    });
  }
}
