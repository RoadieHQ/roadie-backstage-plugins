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
  DescribeVpcsCommand,
  DescribeDhcpOptionsCommand,
  DescribeVpcsCommandOutput,
  DescribeDhcpOptionsCommandOutput,
} from '@aws-sdk/client-ec2';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSVPCProvider } from './AWSVPCProvider';
import { ANNOTATION_VIEW_URL } from '@backstage/catalog-model';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';

const ec2 = mockClient(EC2);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSVPCProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there are no VPCs', () => {
    beforeEach(() => {
      ec2.on(DescribeVpcsCommand).resolves({
        Vpcs: [],
        $metadata: {},
      } as DescribeVpcsCommandOutput);
    });

    it('creates no VPCs', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSVPCProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is a VPC', () => {
    beforeEach(() => {
      ec2.on(DescribeVpcsCommand).resolves({
        Vpcs: [
          {
            VpcId: 'vpc-12345678',
            CidrBlockAssociationSet: [
              {
                CidrBlock: '10.0.0.0/16',
              },
            ],
            DhcpOptionsId: 'dopt-12345678',
            IsDefault: false,
            State: 'available',
            InstanceTenancy: 'default',
            Tags: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
              {
                Key: 'owner',
                Value: 'team-infrastructure',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeVpcsCommandOutput);

      ec2.on(DescribeDhcpOptionsCommand).resolves({
        DhcpOptions: [
          {
            DhcpOptionsId: 'dopt-12345678',
            DhcpConfigurations: [
              {
                Key: 'domain-name',
                Values: [{ Value: 'eu-west-1.compute.internal' }],
              },
              {
                Key: 'domain-name-servers',
                Values: [{ Value: 'AmazonProvidedDNS' }],
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeDhcpOptionsCommandOutput);
    });

    it('creates VPC with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSVPCProvider.example.yaml.njs'),
      ).toString();
      const provider = AWSVPCProvider.fromConfig(config, { logger, template });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates VPC', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSVPCProvider.fromConfig(config, { logger });
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
      const provider = AWSVPCProvider.fromConfig(config, {
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

  describe('where there is a VPC with Name tag', () => {
    beforeEach(() => {
      ec2.on(DescribeVpcsCommand).resolves({
        Vpcs: [
          {
            VpcId: 'vpc-12345678',
            CidrBlockAssociationSet: [
              {
                CidrBlock: '10.0.0.0/16',
              },
              {
                CidrBlock: '172.16.0.0/16',
              },
            ],
            DhcpOptionsId: 'dopt-12345678',
            IsDefault: true,
            State: 'available',
            InstanceTenancy: 'dedicated',
            Tags: [
              {
                Key: 'Name',
                Value: 'My Custom VPC',
              },
              {
                Key: 'Team',
                Value: 'backend-team',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeVpcsCommandOutput);

      ec2.on(DescribeDhcpOptionsCommand).resolves({
        DhcpOptions: [
          {
            DhcpOptionsId: 'dopt-12345678',
            DhcpConfigurations: [
              {
                Key: 'domain-name',
                Values: [{ Value: 'example.com' }],
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeDhcpOptionsCommandOutput);
    });

    it('creates VPC with Name tag as title', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSVPCProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-vpc-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'vpc',
              },
              metadata: expect.objectContaining({
                name: 'vpc-12345678',
                title: 'My Custom VPC',
                cidrBlocks: '10.0.0.0/16, 172.16.0.0/16',
                dhcpOptions: 'domain-name: example.com',
                isDefault: 'Yes',
                state: 'available',
                instanceTenancy: 'dedicated',
                labels: {
                  Name: 'My-Custom-VPC',
                  Team: 'backend-team',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/vpc-id': 'vpc-12345678',
                  'backstage.io/managed-by-location':
                    'aws-vpc-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-vpc-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a VPC without DHCP options', () => {
    beforeEach(() => {
      ec2.on(DescribeVpcsCommand).resolves({
        Vpcs: [
          {
            VpcId: 'vpc-12345678',
            CidrBlockAssociationSet: [
              {
                CidrBlock: '10.0.0.0/16',
              },
            ],
            IsDefault: false,
            State: 'available',
            InstanceTenancy: 'default',
            Tags: [],
          },
        ],
        $metadata: {},
      } as DescribeVpcsCommandOutput);
    });

    it('creates VPC without DHCP options', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSVPCProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-vpc-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'vpc',
              },
              metadata: expect.objectContaining({
                name: 'vpc-12345678',
                title: 'vpc-12345678',
                cidrBlocks: '10.0.0.0/16',
                dhcpOptions: 'None',
                isDefault: 'No',
                state: 'available',
                instanceTenancy: 'default',
                labels: {},
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/vpc-id': 'vpc-12345678',
                  'backstage.io/managed-by-location':
                    'aws-vpc-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-vpc-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a VPC and I have a value mapper', () => {
    beforeEach(() => {
      ec2.on(DescribeVpcsCommand).resolves({
        Vpcs: [
          {
            VpcId: 'vpc-12345678',
            CidrBlockAssociationSet: [
              {
                CidrBlock: '10.0.0.0/16',
              },
            ],
            IsDefault: false,
            State: 'available',
            InstanceTenancy: 'default',
            Tags: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeVpcsCommandOutput);
    });

    it('creates VPC with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSVPCProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-vpc-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'vpc',
              },
              metadata: expect.objectContaining({
                name: 'vpc-12345678',
                title: 'vpc-12345678',
                cidrBlocks: '10.0.0.0/16',
                dhcpOptions: 'None',
                isDefault: 'No',
                state: 'available',
                instanceTenancy: 'default',
                labels: {
                  Environment: 'production//staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/vpc-id': 'vpc-12345678',
                  'backstage.io/managed-by-location':
                    'aws-vpc-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-vpc-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a VPC with DHCP options error', () => {
    beforeEach(() => {
      ec2.on(DescribeVpcsCommand).resolves({
        Vpcs: [
          {
            VpcId: 'vpc-12345678',
            CidrBlockAssociationSet: [
              {
                CidrBlock: '10.0.0.0/16',
              },
            ],
            DhcpOptionsId: 'dopt-12345678',
            IsDefault: false,
            State: 'available',
            InstanceTenancy: 'default',
            Tags: [],
          },
        ],
        $metadata: {},
      } as DescribeVpcsCommandOutput);

      ec2.on(DescribeDhcpOptionsCommand).rejects(new Error('Access denied'));
    });

    it('creates VPC with DHCP options ID when error occurs', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSVPCProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-vpc-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'vpc',
              },
              metadata: expect.objectContaining({
                name: 'vpc-12345678',
                title: 'vpc-12345678',
                cidrBlocks: '10.0.0.0/16',
                dhcpOptions: 'dopt-12345678',
                isDefault: 'No',
                state: 'available',
                instanceTenancy: 'default',
                labels: {},
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/vpc-id': 'vpc-12345678',
                  'backstage.io/managed-by-location':
                    'aws-vpc-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-vpc-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
