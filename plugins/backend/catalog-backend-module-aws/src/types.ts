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
import type {
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import type { Logger } from 'winston';
import type { LabelValueMapper } from './utils/tags';

export type ValueMapping = {
  entityPath: string;
  template?: string;
};
export interface DynamoDbTableDataConfig {
  /**
   * Name of the DDB table
   */
  tableName: string;

  /**
   * Identifier column to be used as the 'name' value in the entity
   * If omitted, the value of the first hash key of the table is used
   */
  identifierColumn?: string;

  /**
   * Additional column value mappings to insert data from the table row to the entity definition
   * A key-value pairs of column name and entity value mapping.
   * The template is using a variable called `value` which can be used to construct entity values from DDB column data
   *
   * Examples:
   *
   * // json
   * myColumnInDdb: {
   *   entityPath: 'metadata.annotations."backstage.io/view-url"',
   *   template: 'https://aws.web-services.eu-west-1.some-service/{{ value }}/display'
   * }
   *
   * // yaml
   * myColumnInDdb:
   *   entityPath: 'metadata.annotations."backstage.io/view-url"'
   *   template: 'https://aws.web-services.eu-west-1.some-service/{{ value }}/display'
   *
   */
  columnValueMapping?: { [columnName: string]: ValueMapping };
}
export interface AWSAccountProviderConfig {
  /**
   * Account ID for this Account
   */
  accountId: string;
  /**
   * Role to assume for this account ID
   */
  roleName: string;
  /**
   * Role ARN to assume for this account ID
   */
  roleArn?: string;
  /**
   * Region to use for this account ID
   */
  region?: string;
  /**
   * External ID to use for the role assume
   */
  externalId?: string;

  /**
   * Configuration object for DynamoDB table data provider
   */
  dynamodbTableData?: DynamoDbTableDataConfig;
}

export interface AWSEntityProviderConfig {
  logger: Logger | LoggerService;
  template?: string;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  taskRunner: SchedulerServiceTaskRunner;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
}

export type AccountConfig = {
  accountId: string;
  roleName: string;
  roleArn?: string;
  externalId?: string;
  region: string;
};

export type DynamicAccountConfig = {
  roleArn: string;
  externalId?: string;
  region: string;
};
