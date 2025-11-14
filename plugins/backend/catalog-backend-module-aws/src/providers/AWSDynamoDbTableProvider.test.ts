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
  DynamoDB,
  ListTablesCommand,
  DescribeTableCommand,
  ListTagsOfResourceCommand,
} from '@aws-sdk/client-dynamodb';
import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSDynamoDbTableProvider } from './AWSDynamoDbTableProvider';
import { ANNOTATION_AWS_DDB_TABLE_ARN } from '../annotations';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';

const eks = mockClient(DynamoDB);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSDynamoDbTableProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there is no clusters', () => {
    beforeEach(() => {
      eks.on(ListTablesCommand).resolves({
        TableNames: [],
      });
    });

    it('creates no clusters', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSDynamoDbTableProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there are is a table', () => {
    beforeEach(() => {
      eks.on(ListTablesCommand).resolves({
        TableNames: ['table1'],
      });
      eks.on(DescribeTableCommand).resolves({
        Table: {
          TableName: 'table1',
          TableArn: 'arn:aws:dynamodb::123456789012:table/table1',
        },
      });
      eks.on(ListTagsOfResourceCommand).resolves({
        Tags: [
          {
            Key: 'something',
            Value: 'something//something',
          },
        ],
      });
    });

    it('creates table', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSDynamoDbTableProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('should support the new backend system', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const taskRunner: SchedulerServiceTaskRunner = {
        run: jest.fn(async task => {
          await task.fn({} as any);
        }),
      };
      const provider = AWSDynamoDbTableProvider.fromConfig(config, {
        logger,
        taskRunner,
      });
      await provider.connect(entityProviderConnection);
      expect(taskRunner.run).toHaveBeenCalledWith(
        expect.objectContaining({
          id: provider.getProviderName(),
          fn: expect.any(Function),
        }),
      );
      expect(entityProviderConnection.applyMutation).toHaveBeenCalled();
    });

    it('creates table with template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(
          dirname(__filename),
          './AWSDynamoDbTableProvider.example.yaml.njs',
        ),
      ).toString();
      const provider = AWSDynamoDbTableProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });
  });

  describe('where there are is a table and I have a value mapper', () => {
    beforeEach(() => {
      eks.on(ListTablesCommand).resolves({
        TableNames: ['table1'],
      });
      eks.on(DescribeTableCommand).resolves({
        Table: {
          TableName: 'table1',
          TableArn: 'arn:aws:dynamodb::123456789012:table/table1',
        },
      });
    });

    it('creates tables with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSDynamoDbTableProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                name: '789400bd545150a5e718539098e053ad2242a887ffe74c390197aed9dceb621',
                title: 'table1',
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_DDB_TABLE_ARN]:
                    'arn:aws:dynamodb::123456789012:table/table1',
                }),
                labels: {
                  something: 'something//something',
                },
              }),
            }),
          }),
        ],
      });
    });
  });
});
