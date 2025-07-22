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
  DescribeSecurityGroupsCommand,
  DescribeSecurityGroupsCommandOutput,
} from '@aws-sdk/client-ec2';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSSecurityGroupProvider } from './AWSSecurityGroupProvider';
import { ANNOTATION_VIEW_URL } from '@backstage/catalog-model';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const ec2 = mockClient(EC2);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSSecurityGroupProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there are no security groups', () => {
    beforeEach(() => {
      ec2.on(DescribeSecurityGroupsCommand).resolves({
        SecurityGroups: [],
        $metadata: {},
      } as DescribeSecurityGroupsCommandOutput);
    });

    it('creates no security groups', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSecurityGroupProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is a security group', () => {
    beforeEach(() => {
      ec2.on(DescribeSecurityGroupsCommand).resolves({
        SecurityGroups: [
          {
            GroupId: 'sg-12345678',
            GroupName: 'my-security-group',
            Description: 'My test security group',
            VpcId: 'vpc-12345678',
            IpPermissions: [
              {
                IpProtocol: 'tcp',
                FromPort: 80,
                ToPort: 80,
                IpRanges: [{ CidrIp: '0.0.0.0/0' }],
              },
              {
                IpProtocol: 'tcp',
                FromPort: 443,
                ToPort: 443,
                UserIdGroupPairs: [{ GroupId: 'sg-87654321' }],
              },
            ],
            IpPermissionsEgress: [
              {
                IpProtocol: '-1',
                IpRanges: [{ CidrIp: '0.0.0.0/0' }],
              },
            ],
            Tags: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeSecurityGroupsCommandOutput);
    });

    it('creates security group with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(
          dirname(__filename),
          './AWSSecurityGroupProvider.example.yaml.njs',
        ),
      ).toString();
      const provider = AWSSecurityGroupProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-security-group-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'security-group',
              },
              metadata: expect.objectContaining({
                name: 'sg-12345678',
                title: 'my-security-group',
                description: 'My test security group',
                vpcId: 'vpc-12345678',
                groupName: 'my-security-group',
                ingressRules: 'tcp:80 from 0.0.0.0/0; tcp:443 from sg-87654321',
                egressRules: 'All:All to 0.0.0.0/0',
                labels: {
                  Environment: 'production--staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/security-group-id': 'sg-12345678',
                  'backstage.io/managed-by-location':
                    'aws-security-group-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-security-group-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });

    it('creates security group', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSecurityGroupProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-security-group-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'security-group',
              },
              metadata: expect.objectContaining({
                name: 'sg-12345678',
                title: 'my-security-group',
                description: 'My test security group',
                vpcId: 'vpc-12345678',
                groupName: 'my-security-group',
                ingressRules: 'tcp:80 from 0.0.0.0/0; tcp:443 from sg-87654321',
                egressRules: 'All:All to 0.0.0.0/0',
                labels: {
                  Environment: 'production--staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/security-group-id': 'sg-12345678',
                  'backstage.io/managed-by-location':
                    'aws-security-group-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-security-group-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a security group with Name tag', () => {
    beforeEach(() => {
      ec2.on(DescribeSecurityGroupsCommand).resolves({
        SecurityGroups: [
          {
            GroupId: 'sg-12345678',
            GroupName: 'my-security-group',
            Description: 'My test security group',
            VpcId: 'vpc-12345678',
            IpPermissions: [],
            IpPermissionsEgress: [],
            Tags: [
              {
                Key: 'Name',
                Value: 'My Custom Security Group',
              },
              {
                Key: 'Team',
                Value: 'backend-team',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeSecurityGroupsCommandOutput);
    });

    it('creates security group with Name tag as title', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSecurityGroupProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-security-group-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'security-group',
              },
              metadata: expect.objectContaining({
                name: 'sg-12345678',
                title: 'My Custom Security Group',
                description: 'My test security group',
                vpcId: 'vpc-12345678',
                groupName: 'my-security-group',
                ingressRules: 'None',
                egressRules: 'None',
                labels: {
                  Name: 'My Custom Security Group',
                  Team: 'backend-team',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/security-group-id': 'sg-12345678',
                  'backstage.io/managed-by-location':
                    'aws-security-group-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-security-group-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a security group and I have a value mapper', () => {
    beforeEach(() => {
      ec2.on(DescribeSecurityGroupsCommand).resolves({
        SecurityGroups: [
          {
            GroupId: 'sg-12345678',
            GroupName: 'my-security-group',
            Description: 'My test security group',
            VpcId: 'vpc-12345678',
            IpPermissions: [],
            IpPermissionsEgress: [],
            Tags: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeSecurityGroupsCommandOutput);
    });

    it('creates security group with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSecurityGroupProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-security-group-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'security-group',
              },
              metadata: expect.objectContaining({
                name: 'sg-12345678',
                title: 'my-security-group',
                description: 'My test security group',
                vpcId: 'vpc-12345678',
                groupName: 'my-security-group',
                ingressRules: 'None',
                egressRules: 'None',
                labels: {
                  Environment: 'production//staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_VIEW_URL]: expect.stringContaining(
                    'console.aws.amazon.com',
                  ),
                  'amazonaws.com/security-group-id': 'sg-12345678',
                  'backstage.io/managed-by-location':
                    'aws-security-group-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-security-group-provider-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there are multiple security groups with pagination', () => {
    beforeEach(() => {
      ec2.reset();
      sts.on(GetCallerIdentityCommand).resolves({});
      ec2
        .on(DescribeSecurityGroupsCommand)
        .resolvesOnce({
          SecurityGroups: [
            {
              GroupId: 'sg-12345678',
              GroupName: 'my-security-group-1',
              Description: 'First security group',
              VpcId: 'vpc-12345678',
              IpPermissions: [],
              IpPermissionsEgress: [],
              Tags: [],
            },
          ],
          NextToken: 'next-token-123',
          $metadata: {},
        } as DescribeSecurityGroupsCommandOutput)
        .resolvesOnce({
          SecurityGroups: [
            {
              GroupId: 'sg-87654321',
              GroupName: 'my-security-group-2',
              Description: 'Second security group',
              VpcId: 'vpc-87654321',
              IpPermissions: [],
              IpPermissionsEgress: [],
              Tags: [],
            },
          ],
          $metadata: {},
        } as DescribeSecurityGroupsCommandOutput);
    });

    it('creates multiple security groups with pagination', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSecurityGroupProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-security-group-provider-0',
            entity: expect.objectContaining({
              metadata: expect.objectContaining({
                name: 'sg-12345678',
                title: 'my-security-group-1',
              }),
            }),
          }),
          expect.objectContaining({
            locationKey: 'aws-security-group-provider-0',
            entity: expect.objectContaining({
              metadata: expect.objectContaining({
                name: 'sg-87654321',
                title: 'my-security-group-2',
              }),
            }),
          }),
        ],
      });
    });
  });
});
