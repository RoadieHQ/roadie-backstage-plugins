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

import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { EC2, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSEC2Provider } from './AWSEC2Provider';
import { ANNOTATION_AWS_EC2_INSTANCE_ID } from '../annotations';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const ec2 = mockClient(EC2);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSEC2Provider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there is instances', () => {
    beforeEach(() => {
      ec2.on(DescribeInstancesCommand).resolves({
        Reservations: [],
      });
    });

    it('creates no instances', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEC2Provider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is an instance', () => {
    beforeEach(() => {
      ec2.on(DescribeInstancesCommand).resolves({
        Reservations: [
          {
            ReservationId: 'reservation1',
            Instances: [
              {
                InstanceId: 'asdf',
                Platform: 'Windows',
                InstanceType: 't3.large',
                Monitoring: {
                  State: 'enabled',
                },
                Placement: {
                  AvailabilityZone: 'us-east-1a',
                },
                BlockDeviceMappings: [
                  { DeviceName: '/dev/sda1' },
                  { DeviceName: '/dev/sdb' },
                ],
                CpuOptions: {
                  CoreCount: 4,
                  ThreadsPerCore: 2,
                },
                Tags: [
                  {
                    Key: 'Name',
                    Value: 'test-instance',
                  },
                  {
                    Key: 'owner',
                    Value: 'team-platform',
                  },
                  {
                    Key: 'something',
                    Value: 'something//something',
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    // This test ensures backward compatibility and basic functionality
    it('creates table', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEC2Provider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates table with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSEC2Provider.example.yaml.njk'),
      ).toString();
      const provider = AWSEC2Provider.fromConfig(config, { logger, template });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });
  });

  describe('where there are is a table and I have a value mapper', () => {
    beforeEach(() => {
      ec2.on(DescribeInstancesCommand).resolves({
        Reservations: [
          {
            ReservationId: 'reservation1',
            Instances: [
              {
                InstanceId: 'asdf',
                Tags: [
                  {
                    Key: 'owner',
                    Value: 'team-infrastructure',
                  },
                  {
                    Key: 'something',
                    Value: 'something//something',
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('creates tables with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };

      const provider = AWSEC2Provider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });

      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-ec2-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'team-infrastructure',
                type: 'ec2-instance',
              },
              metadata: expect.objectContaining({
                labels: {
                  owner: 'team-infrastructure',
                  something: 'something//something',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_EC2_INSTANCE_ID]: 'asdf',
                  'backstage.io/managed-by-location':
                    'aws-ec2-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-ec2-provider-0:arn:aws:iam::123456789012:role/role1',

                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/ec2/v2/home',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is an instance with dynamic account config', () => {
    beforeEach(() => {
      ec2.on(DescribeInstancesCommand).resolves({
        Reservations: [
          {
            ReservationId: 'reservation-dynamic',
            Instances: [
              {
                InstanceId: 'i-dynamic-123',
              },
            ],
          },
        ],
      });

      // Mock STS to return dynamic account
      sts.on(GetCallerIdentityCommand).resolves({
        Account: '999888777666',
      });
    });

    it('creates instance with different region and accountId from dynamic config', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };

      const dynamicRoleArn = 'arn:aws:iam::999888777666:role/dynamic-role';
      const dynamicRegion = 'us-east-1';
      const dynamicAccountId = '999888777666';

      const provider = AWSEC2Provider.fromConfig(config, {
        logger,
        useTemporaryCredentials: true,
      });

      await provider.connect(entityProviderConnection);
      await provider.run({
        roleArn: dynamicRoleArn,
        region: dynamicRegion,
        accountId: dynamicAccountId,
      });

      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              metadata: expect.objectContaining({
                name: 'i-dynamic-123',
                annotations: expect.objectContaining({
                  // Validates roleArn from dynamic config is used
                  'backstage.io/managed-by-location': `aws-ec2-provider-0:${dynamicRoleArn}`,
                  'backstage.io/managed-by-origin-location': `aws-ec2-provider-0:${dynamicRoleArn}`,
                  // Validates accountId (derived from roleArn) from dynamic config is used
                  'amazon.com/account-id': dynamicAccountId,
                  // Validates region from dynamic config is used
                  'backstage.io/view-url':
                    expect.stringContaining(dynamicRegion),
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
