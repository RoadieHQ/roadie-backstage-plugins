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
import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { STS } from '@aws-sdk/client-sts';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import {
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { merge } from 'lodash';
import type { Logger } from 'winston';

import {
  ANNOTATION_ACCOUNT_ID,
  ANNOTATION_AWS_DDB_TABLE_ARN,
} from '../annotations';
import { AWSEntityProviderConfig, ValueMapping } from '../types';
import { mapColumnsToEntityValues } from '../utils/columnMapper';
import { CloudResourceTemplate } from '../utils/templating';

type DdbTableDataConfigOptions = {
  entityKind?: string;
  tableName: string;
  identifierColumn?: string;
  columnValueMapping?: { [key: string]: ValueMapping };
};

import defaultTemplate from './AWSDynamoDbTableDataProvider.default.yaml.njk';

/**
 * Provides entities from AWS DynamoDB service.
 */
export class AWSDynamoDbTableDataProvider implements EntityProvider {
  private readonly accountId: string;
  private readonly roleArn: string;
  private readonly tableDataConfig: DdbTableDataConfigOptions;
  private readonly logger: Logger | LoggerService;
  private readonly taskRunner?: SchedulerServiceTaskRunner;
  private readonly template!: CloudResourceTemplate<Record<string, any>>;

  private connection?: EntityProviderConnection;

  static fromConfig(
    config: Config,
    options: Pick<
      AWSEntityProviderConfig,
      'logger' | 'taskRunner' | 'template'
    >,
  ) {
    return new AWSDynamoDbTableDataProvider(
      config.getString('accountId'),
      config.getString('roleName'),
      config.get<DdbTableDataConfigOptions>('dynamodbTableData'),
      options.logger,
      options.taskRunner,
      options.template,
    );
  }

  constructor(
    accountId: string,
    roleArn: string,
    options: DdbTableDataConfigOptions,
    logger: Logger | LoggerService,
    taskRunner?: SchedulerServiceTaskRunner,
    template?: string,
  ) {
    this.accountId = accountId;
    this.roleArn = roleArn;
    this.tableDataConfig = options;
    this.logger = logger;
    this.taskRunner = taskRunner;

    this.template = CloudResourceTemplate.fromConfig({
      templateString: template || defaultTemplate,
      accountId: this.accountId,
      region: 'us-east-1', // Will be overridden by child template in run()
      getResourceAnnotations: this.getResourceAnnotations.bind(this),
    });
  }

  getProviderName(): string {
    return `aws-dynamo-db-table-${this.accountId}-${this.tableDataConfig.tableName}`;
  }

  getResourceAnnotations(
    _resource: Record<string, any>,
    context: { accountId: string; region: string },
  ): Record<string, string> {
    const tableArn = `arn:aws:dynamodb:${context.region}:${context.accountId}:table/${this.tableDataConfig.tableName}`;
    return {
      [ANNOTATION_AWS_DDB_TABLE_ARN]: tableArn,
      'amazon.com/dynamodb-table-name': this.tableDataConfig.tableName,
    };
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    if (this.taskRunner?.run) {
      await this.taskRunner.run({
        id: this.getProviderName(),
        fn: async () => {
          await this.run();
        },
      });
    }
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

      // Get actual accountId and region from STS
      const actualAccountId = account.Account || this.accountId;

      // Create child template with runtime values
      const childTemplate = this.template.child({
        accountId: actualAccountId,
        defaultAnnotations,
      });

      // Render entities
      const entities = await Promise.all(
        tableRows.Items?.map(async row => {
          // Render base entity from template
          const entity = await childTemplate.render({
            data: row,
            additionalData: {
              identifierColumn: idColumn,
              entityKind: this.tableDataConfig.entityKind,
            },
          });

          // Apply column value mapping (post-processing)
          if (this.tableDataConfig.columnValueMapping) {
            const mappedColumns = mapColumnsToEntityValues(
              this.tableDataConfig.columnValueMapping,
              row,
            );
            return merge(entity, mappedColumns);
          }

          return entity;
        }) ?? [],
      );

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
