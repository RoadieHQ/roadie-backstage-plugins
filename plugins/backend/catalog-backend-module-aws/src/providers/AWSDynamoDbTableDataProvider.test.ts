/*
 * Copyright 2022 Larder Software Limited
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
import { DescribeTableCommand, DynamoDB } from '@aws-sdk/client-dynamodb';
import { GetCallerIdentityCommand, STS } from '@aws-sdk/client-sts';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';

import { AWSDynamoDbTableDataProvider } from './AWSDynamoDbTableDataProvider';
import template from './AWSDynamoDbTableDataProvider.example.yaml.njk';

const dynamodb = mockClient(DynamoDB);
const dynamodbDoc = mockClient(DynamoDBDocumentClient);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

const validConfig = {
  accountId: '123456789012',
  roleName: 'arn:aws:sts::123456789012:role/tester',
  region: 'eu-west-1',
  dynamodbTableData: {
    tableName: 'TenantManagerState',
    columnValueMapping: {
      url: {
        entityPath: 'metadata.annotations."test-annotation"',
      },
    },
  },
};

const invalidConfig = {
  accountId: '123456789012',
  roleName: 'arn:aws:sts::123456789012:role/tester',
  region: 'eu-west-1',
};

describe('AWSDynamoDbTableDataProvider', () => {
  beforeEach(() => {
    dynamodb.reset();
    dynamodbDoc.reset();
    sts.reset();
    sts.on(GetCallerIdentityCommand).resolves({
      Account: '123456789012',
    });
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
    const config = ConfigReader.fromConfigs([
      {
        context: 'unit-test',
        data: validConfig,
      },
    ]);

    const provider = AWSDynamoDbTableDataProvider.fromConfig(config, {
      logger,
      taskRunner,
    });

    jest.spyOn(provider, 'run');

    await provider.connect(entityProviderConnection);
    expect(taskRunner.run).toHaveBeenCalledWith(
      expect.objectContaining({
        id: provider.getProviderName(),
        fn: expect.any(Function),
      }),
    );
    expect(provider.run).toHaveBeenCalled();
  });

  it('should blow up on incorrect configs', () => {
    const config = ConfigReader.fromConfigs([
      {
        context: 'unit-test',
        data: invalidConfig,
      },
    ]);
    const testWrapper = () => {
      AWSDynamoDbTableDataProvider.fromConfig(config, {
        logger,
      });
    };
    expect(testWrapper).toThrow(
      "Missing required config value at 'dynamodbTableData'",
    );
  });
  it('should not blow up on correct configs', () => {
    const config = ConfigReader.fromConfigs([
      {
        context: 'unit-test',
        data: validConfig,
      },
    ]);
    const testWrapper = () => {
      AWSDynamoDbTableDataProvider.fromConfig(config, {
        logger,
      });
    };
    expect(testWrapper).not.toThrow();
  });

  it('should not blow up on correct configs using template', () => {
    const config = ConfigReader.fromConfigs([
      {
        context: 'unit-test',
        data: validConfig,
      },
    ]);
    const testWrapper = () => {
      AWSDynamoDbTableDataProvider.fromConfig(config, {
        logger,
        template,
      });
    };
    expect(testWrapper).not.toThrow();
  });

  describe('where there are table rows with template', () => {
    beforeEach(() => {
      dynamodb.on(DescribeTableCommand).resolves({
        Table: {
          TableName: 'CustomTableName',
          TableArn:
            'arn:aws:dynamodb:us-west-2:999888777666:table/CustomTableName',
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
        },
      });
      dynamodbDoc.on(ScanCommand).resolves({
        Items: [
          {
            id: 'custom-id-1',
            TableName: 'CustomTableName',
            TableArn:
              'arn:aws:dynamodb:us-west-2:999888777666:table/CustomTableName',
          },
        ],
      });
    });

    it('creates entities from table rows using custom template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const config = ConfigReader.fromConfigs([
        {
          context: 'unit-test',
          data: {
            accountId: '999888777666',
            roleName: 'arn:aws:sts::999888777666:role/custom-role',
            region: 'us-west-2',
            dynamodbTableData: {
              tableName: 'CustomTableName',
            },
          },
        },
      ]);
      const provider = AWSDynamoDbTableDataProvider.fromConfig(config, {
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

  describe('where there are table rows', () => {
    beforeEach(() => {
      dynamodb.on(DescribeTableCommand).resolves({
        Table: {
          TableName: 'TenantManagerState',
          TableArn:
            'arn:aws:dynamodb:eu-west-1:123456789012:table/TenantManagerState',
          KeySchema: [
            {
              AttributeName: 'tenantId',
              KeyType: 'HASH',
            },
          ],
        },
      });
      dynamodbDoc.on(ScanCommand).resolves({
        Items: [
          {
            tenantId: 'tenant-123',
            url: 'https://example.com',
            status: 'active',
          },
          {
            tenantId: 'tenant-456',
            url: 'https://example2.com',
            status: 'inactive',
          },
        ],
      });
    });

    it('creates entities from table rows', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const config = ConfigReader.fromConfigs([
        {
          context: 'unit-test',
          data: validConfig,
        },
      ]);
      const provider = AWSDynamoDbTableDataProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();

      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });
  });
});
