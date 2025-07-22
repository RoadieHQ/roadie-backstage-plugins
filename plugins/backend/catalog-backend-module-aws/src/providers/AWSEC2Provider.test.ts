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

  describe('where there is no instances', () => {
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
                Tags: [
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

    it('creates table', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEC2Provider.fromConfig(config, { logger });
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
                owner: 'unknown',
                type: 'ec2-instance',
              },
              metadata: expect.objectContaining({
                labels: {
                  something: 'something--something',
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

    it('creates table with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSEC2Provider.example.yaml.njs'),
      ).toString();
      const provider = AWSEC2Provider.fromConfig(config, { logger, template });
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
                type: 'ec2-instance',
              },
              metadata: expect.objectContaining({
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
                owner: 'unknown',
                type: 'ec2-instance',
              },
              metadata: expect.objectContaining({
                labels: {
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
});
