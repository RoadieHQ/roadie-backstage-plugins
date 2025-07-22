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
import {
  EC2,
  DescribeSubnetsCommand,
  DescribeSubnetsCommandOutput,
} from '@aws-sdk/client-ec2';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSSubnetProvider } from './AWSSubnetProvider';
import { ANNOTATION_VIEW_URL } from '@backstage/catalog-model';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const ec2 = mockClient(EC2);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSSubnetProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there are no subnets', () => {
    beforeEach(() => {
      ec2.on(DescribeSubnetsCommand).resolves({
        Subnets: [],
        $metadata: {},
      } as DescribeSubnetsCommandOutput);
    });

    it('creates no subnets', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSubnetProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is a subnet', () => {
    beforeEach(() => {
      ec2.on(DescribeSubnetsCommand).resolves({
        Subnets: [
          {
            SubnetId: 'subnet-12345678',
            CidrBlock: '10.0.1.0/24',
            VpcId: 'vpc-12345678',
            AvailabilityZone: 'eu-west-1a',
            AvailableIpAddressCount: 251,
            DefaultForAz: false,
            MapPublicIpOnLaunch: true,
            State: 'available',
            Tags: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeSubnetsCommandOutput);
    });

    it('creates subnet with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSSubnetProvider.example.yaml.njs'),
      ).toString();
      const provider = AWSSubnetProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-subnet-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              metadata: expect.objectContaining({
                name: 'subnet-12345678',
                cidrBlock: '10.0.1.0/24',
                vpcId: 'vpc-12345678',
                availabilityZone: 'eu-west-1a',
                availableIpAddressCount: 251,
                defaultForAz: false,
                mapPublicIpOnLaunch: true,
                state: 'available',
                labels: {
                  Environment: 'production--staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/subnet-id': 'subnet-12345678',
                  'backstage.io/managed-by-location':
                    'aws-subnet-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-subnet-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });

    it('creates subnet', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSubnetProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-subnet-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'subnet',
              },
              metadata: expect.objectContaining({
                name: 'subnet-12345678',
                cidrBlock: '10.0.1.0/24',
                vpcId: 'vpc-12345678',
                availabilityZone: 'eu-west-1a',
                availableIpAddressCount: 251,
                defaultForAz: 'No',
                mapPublicIpOnLaunch: 'Yes',
                state: 'available',
                labels: {
                  Environment: 'production--staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/subnet-id': 'subnet-12345678',
                  'backstage.io/managed-by-location':
                    'aws-subnet-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-subnet-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a subnet with Name tag', () => {
    beforeEach(() => {
      ec2.on(DescribeSubnetsCommand).resolves({
        Subnets: [
          {
            SubnetId: 'subnet-12345678',
            CidrBlock: '10.0.1.0/24',
            VpcId: 'vpc-12345678',
            AvailabilityZone: 'eu-west-1a',
            AvailableIpAddressCount: 251,
            DefaultForAz: true,
            MapPublicIpOnLaunch: false,
            State: 'available',
            Tags: [
              {
                Key: 'Name',
                Value: 'My Custom Subnet',
              },
              {
                Key: 'Team',
                Value: 'backend-team',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeSubnetsCommandOutput);
    });

    it('creates subnet with tags', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSubnetProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-subnet-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'subnet',
              },
              metadata: expect.objectContaining({
                name: 'subnet-12345678',
                cidrBlock: '10.0.1.0/24',
                vpcId: 'vpc-12345678',
                availabilityZone: 'eu-west-1a',
                availableIpAddressCount: 251,
                defaultForAz: 'Yes',
                mapPublicIpOnLaunch: 'No',
                state: 'available',
                labels: {
                  Name: 'My Custom Subnet',
                  Team: 'backend-team',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/subnet-id': 'subnet-12345678',
                  'backstage.io/managed-by-location':
                    'aws-subnet-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-subnet-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a subnet and I have a value mapper', () => {
    beforeEach(() => {
      ec2.on(DescribeSubnetsCommand).resolves({
        Subnets: [
          {
            SubnetId: 'subnet-12345678',
            CidrBlock: '10.0.1.0/24',
            VpcId: 'vpc-12345678',
            AvailabilityZone: 'eu-west-1a',
            AvailableIpAddressCount: 251,
            DefaultForAz: false,
            MapPublicIpOnLaunch: true,
            State: 'available',
            Tags: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeSubnetsCommandOutput);
    });

    it('creates subnet with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSubnetProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-subnet-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'subnet',
              },
              metadata: expect.objectContaining({
                name: 'subnet-12345678',
                cidrBlock: '10.0.1.0/24',
                vpcId: 'vpc-12345678',
                availabilityZone: 'eu-west-1a',
                availableIpAddressCount: 251,
                defaultForAz: 'No',
                mapPublicIpOnLaunch: 'Yes',
                state: 'available',
                labels: {
                  Environment: 'production//staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/subnet-id': 'subnet-12345678',
                  'backstage.io/managed-by-location':
                    'aws-subnet-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-subnet-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there are multiple subnets with pagination', () => {
    beforeEach(() => {
      ec2.reset();
      sts.on(GetCallerIdentityCommand).resolves({});
      ec2
        .on(DescribeSubnetsCommand)
        .resolvesOnce({
          Subnets: [
            {
              SubnetId: 'subnet-12345678',
              CidrBlock: '10.0.1.0/24',
              VpcId: 'vpc-12345678',
              AvailabilityZone: 'eu-west-1a',
              AvailableIpAddressCount: 251,
              DefaultForAz: false,
              MapPublicIpOnLaunch: true,
              State: 'available',
              Tags: [],
            },
          ],
          NextToken: 'next-token-123',
          $metadata: {},
        } as DescribeSubnetsCommandOutput)
        .resolvesOnce({
          Subnets: [
            {
              SubnetId: 'subnet-87654321',
              CidrBlock: '10.0.2.0/24',
              VpcId: 'vpc-87654321',
              AvailabilityZone: 'eu-west-1b',
              AvailableIpAddressCount: 250,
              DefaultForAz: true,
              MapPublicIpOnLaunch: false,
              State: 'available',
              Tags: [],
            },
          ],
          $metadata: {},
        } as DescribeSubnetsCommandOutput);
    });

    it('creates multiple subnets with pagination', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSubnetProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-subnet-provider-0',
            entity: expect.objectContaining({
              metadata: expect.objectContaining({
                name: 'subnet-12345678',
                cidrBlock: '10.0.1.0/24',
                availabilityZone: 'eu-west-1a',
              }),
            }),
          }),
          expect.objectContaining({
            locationKey: 'aws-subnet-provider-0',
            entity: expect.objectContaining({
              metadata: expect.objectContaining({
                name: 'subnet-87654321',
                cidrBlock: '10.0.2.0/24',
                availabilityZone: 'eu-west-1b',
              }),
            }),
          }),
        ],
      });
    });
  });
});
