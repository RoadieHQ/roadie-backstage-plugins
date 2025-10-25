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

import { readFileSync } from 'fs';
import { dirname, join } from 'path';

import { ConfigReader } from '@backstage/config';
import { createLogger } from 'winston';

import { AWSDynamoDbTableDataProvider } from './AWSDynamoDbTableDataProvider';

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
  it('should blow up on incorrect configs', () => {
    const config = ConfigReader.fromConfigs([
      {
        context: 'unit-test',
        data: invalidConfig,
      },
    ]);
    const testWrapper = () => {
      AWSDynamoDbTableDataProvider.fromConfig(config, {
        logger: createLogger(),
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
        logger: createLogger(),
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
    const template = readFileSync(
      join(
        dirname(__filename),
        './AWSDynamoDbTableDataProvider.example.yaml.njs',
      ),
    ).toString();
    const testWrapper = () => {
      AWSDynamoDbTableDataProvider.fromConfig(config, {
        logger: createLogger(),
        template,
      });
    };
    expect(testWrapper).not.toThrow();
  });
});
