/*
 * Copyright 2025 Larder Software Limited
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
import { DescribeDBInstancesCommand, RDS } from '@aws-sdk/client-rds';
import { GetCallerIdentityCommand, STS } from '@aws-sdk/client-sts';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';

import { ANNOTATION_AWS_RDS_INSTANCE_ARN } from '../annotations';

import { AWSRDSProvider } from './AWSRDSProvider';
import template from './AWSRDSProvider.example.yaml.njk';

const rds = mockClient(RDS);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSRDSProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there are no DB instances', () => {
    beforeEach(() => {
      rds.on(DescribeDBInstancesCommand).resolves({
        DBInstances: [],
      });
    });

    it('creates no DB instances', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSRDSProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is a DB instance', () => {
    beforeEach(() => {
      rds.on(DescribeDBInstancesCommand).resolves({
        DBInstances: [
          {
            DBInstanceIdentifier: 'my-database-instance',
            DBInstanceArn:
              'arn:aws:rds:eu-west-1:123456789012:db:my-database-instance',
            DBInstanceClass: 'db.t3.micro',
            Engine: 'mysql',
            EngineVersion: '8.0.35',
            AllocatedStorage: 20,
            PreferredMaintenanceWindow: 'sun:03:00-sun:04:00',
            PreferredBackupWindow: '02:00-03:00',
            BackupRetentionPeriod: 7,
            MultiAZ: false,
            AutoMinorVersionUpgrade: true,
            PubliclyAccessible: false,
            StorageType: 'gp2',
            PerformanceInsightsEnabled: false,
            TagList: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
      });
    });

    it('creates DB instance with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSRDSProvider.fromConfig(config, { logger, template });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates DB instance', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSRDSProvider.fromConfig(config, { logger });
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
      const provider = AWSRDSProvider.fromConfig(config, {
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
  });

  describe('where there is a DB instance and I have a value mapper', () => {
    beforeEach(() => {
      rds.on(DescribeDBInstancesCommand).resolves({
        DBInstances: [
          {
            DBInstanceIdentifier: 'my-database-instance',
            DBInstanceArn:
              'arn:aws:rds:eu-west-1:123456789012:db:my-database-instance',
            DBInstanceClass: 'db.r5.large',
            Engine: 'postgres',
            EngineVersion: '14.9',
            AllocatedStorage: 100,
            PreferredMaintenanceWindow: 'mon:04:00-mon:05:00',
            PreferredBackupWindow: '03:00-04:00',
            BackupRetentionPeriod: 14,
            MultiAZ: true,
            AutoMinorVersionUpgrade: false,
            PubliclyAccessible: true,
            StorageType: 'io1',
            PerformanceInsightsEnabled: true,
            TagList: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
      });
    });

    it('creates DB instance with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSRDSProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-rds-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'rds-instance',
              },
              metadata: expect.objectContaining({
                name: 'my-database-instance',
                title: 'my-database-instance',
                dbInstanceClass: 'db.r5.large',
                dbEngine: 'postgres',
                dbEngineVersion: '14.9',
                allocatedStorage: 100,
                preferredMaintenanceWindow: 'mon:04:00-mon:05:00',
                preferredBackupWindow: '03:00-04:00',
                backupRetentionPeriod: 14,
                isMultiAz: true,
                automaticMinorVersionUpgrade: false,
                isPubliclyAccessible: true,
                storageType: 'io1',
                isPerformanceInsightsEnabled: true,
                labels: {
                  Environment: 'production//staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_RDS_INSTANCE_ARN]:
                    'arn:aws:rds:eu-west-1:123456789012:db:my-database-instance',
                  'backstage.io/managed-by-location':
                    'aws-rds-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-rds-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://console.aws.amazon.com/rds/home?region=eu-west-1#database:id=my-database-instance',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a DB instance with Name tag', () => {
    beforeEach(() => {
      rds.on(DescribeDBInstancesCommand).resolves({
        DBInstances: [
          {
            DBInstanceIdentifier: 'my-database-instance',
            DBInstanceArn:
              'arn:aws:rds:eu-west-1:123456789012:db:my-database-instance',
            DBInstanceClass: 'db.t3.small',
            Engine: 'mariadb',
            EngineVersion: '10.6.14',
            AllocatedStorage: 50,
            PreferredMaintenanceWindow: 'tue:05:00-tue:06:00',
            PreferredBackupWindow: '04:00-05:00',
            BackupRetentionPeriod: 30,
            MultiAZ: false,
            AutoMinorVersionUpgrade: true,
            PubliclyAccessible: false,
            StorageType: 'gp3',
            PerformanceInsightsEnabled: false,
            TagList: [
              {
                Key: 'Name',
                Value: 'My Production Database',
              },
              {
                Key: 'Team',
                Value: 'backend-team',
              },
            ],
          },
        ],
      });
    });

    it('creates DB instance with Name tag as title', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSRDSProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-rds-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'rds-instance',
              },
              metadata: expect.objectContaining({
                name: 'my-database-instance',
                title: 'my-database-instance',
                dbInstanceClass: 'db.t3.small',
                dbEngine: 'mariadb',
                dbEngineVersion: '10.6.14',
                allocatedStorage: 50,
                preferredMaintenanceWindow: 'tue:05:00-tue:06:00',
                preferredBackupWindow: '04:00-05:00',
                backupRetentionPeriod: 30,
                isMultiAz: false,
                automaticMinorVersionUpgrade: true,
                isPubliclyAccessible: false,
                storageType: 'gp3',
                isPerformanceInsightsEnabled: false,
                labels: {
                  Name: 'My-Production-Database',
                  Team: 'backend-team',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_RDS_INSTANCE_ARN]:
                    'arn:aws:rds:eu-west-1:123456789012:db:my-database-instance',
                  'backstage.io/managed-by-location':
                    'aws-rds-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-rds-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://console.aws.amazon.com/rds/home?region=eu-west-1#database:id=my-database-instance',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a DB instance with long name', () => {
    beforeEach(() => {
      rds.on(DescribeDBInstancesCommand).resolves({
        DBInstances: [
          {
            DBInstanceIdentifier:
              'my-very-long-database-instance-name-that-exceeds-sixty-two-characters-limit',
            DBInstanceArn:
              'arn:aws:rds:eu-west-1:123456789012:db:my-very-long-database-instance-name-that-exceeds-sixty-two-characters-limit',
            DBInstanceClass: 'db.t3.micro',
            Engine: 'mysql',
            EngineVersion: '8.0.35',
            TagList: [],
          },
        ],
      });
    });

    it('creates DB instance with truncated name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSRDSProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-rds-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'rds-instance',
              },
              metadata: expect.objectContaining({
                name: 'my-very-long-database-instance-name-that-exceeds-sixty-two-cha',
                title:
                  'my-very-long-database-instance-name-that-exceeds-sixty-two-characters-limit',
                dbInstanceClass: 'db.t3.micro',
                dbEngine: 'mysql',
                dbEngineVersion: '8.0.35',
                allocatedStorage: null,
                preferredMaintenanceWindow: null,
                preferredBackupWindow: null,
                backupRetentionPeriod: null,
                isMultiAz: null,
                automaticMinorVersionUpgrade: null,
                isPubliclyAccessible: null,
                storageType: null,
                isPerformanceInsightsEnabled: null,
                labels: {},
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_RDS_INSTANCE_ARN]:
                    'arn:aws:rds:eu-west-1:123456789012:db:my-very-long-database-instance-name-that-exceeds-sixty-two-characters-limit',
                  'backstage.io/managed-by-location':
                    'aws-rds-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-rds-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://console.aws.amazon.com/rds/home?region=eu-west-1#database:id=my-very-long-database-instance-name-that-exceeds-sixty-two-characters-limit',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a DB instance without required fields', () => {
    beforeEach(() => {
      rds.on(DescribeDBInstancesCommand).resolves({
        DBInstances: [
          {
            // Missing DBInstanceIdentifier and DBInstanceArn
            DBInstanceClass: 'db.t3.micro',
            Engine: 'mysql',
            TagList: [],
          },
        ],
      });
    });

    it('skips DB instance without required fields', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSRDSProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });
});
