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
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
  DescribeTagsCommand,
  DescribeLoadBalancersCommandOutput,
  DescribeTagsCommandOutput,
} from '@aws-sdk/client-elastic-load-balancing-v2';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSLoadBalancerProvider } from './AWSLoadBalancerProvider';

const elbv2 = mockClient(ElasticLoadBalancingV2Client as any);
const sts = mockClient(STS as any);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSLoadBalancerProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand as any).resolves({});
  });

  describe('where there are no load balancers', () => {
    beforeEach(() => {
      elbv2.on(DescribeLoadBalancersCommand as any).resolves({
        LoadBalancers: [],
        $metadata: {},
      } as DescribeLoadBalancersCommandOutput);
    });

    it('creates no load balancers', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSLoadBalancerProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is a load balancer', () => {
    beforeEach(() => {
      elbv2.on(DescribeLoadBalancersCommand as any).resolves({
        LoadBalancers: [
          {
            LoadBalancerArn:
              'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
            LoadBalancerName: 'my-load-balancer',
            DNSName: 'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
            Scheme: 'internet-facing',
            VpcId: 'vpc-12345678',
            Type: 'application',
            State: {
              Code: 'active',
            },
            AvailabilityZones: [
              {
                ZoneName: 'eu-west-1a',
              },
              {
                ZoneName: 'eu-west-1b',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeLoadBalancersCommandOutput);

      elbv2.on(DescribeTagsCommand as any).resolves({
        TagDescriptions: [
          {
            ResourceArn:
              'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
            Tags: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeTagsCommandOutput);
    });

    it('creates load balancer', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSLoadBalancerProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-load-balancer-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'load-balancer',
              },
              metadata: expect.objectContaining({
                name: 'my-load-balancer',
                title: 'my-load-balancer',
                dnsName:
                  'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
                scheme: 'internet-facing',
                vpcId: 'vpc-12345678',
                type: 'application',
                state: 'active',
                availabilityZones: 'eu-west-1a, eu-west-1b',
                labels: {
                  Environment: 'production--staging',
                },
                annotations: expect.objectContaining({
                  'amazonaws.com/load-balancer-arn':
                    'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
                  'amazonaws.com/load-balancer-dns-name':
                    'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
                  'backstage.io/managed-by-location':
                    'aws-load-balancer-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-load-balancer-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#LoadBalancers:loadBalancerId=50dc6c495c0c9188;sort=loadBalancerName',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a load balancer and I have a value mapper', () => {
    beforeEach(() => {
      elbv2.on(DescribeLoadBalancersCommand as any).resolves({
        LoadBalancers: [
          {
            LoadBalancerArn:
              'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
            LoadBalancerName: 'my-load-balancer',
            DNSName: 'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
            Scheme: 'internet-facing',
            VpcId: 'vpc-12345678',
            Type: 'application',
            State: {
              Code: 'active',
            },
            AvailabilityZones: [
              {
                ZoneName: 'eu-west-1a',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeLoadBalancersCommandOutput);

      elbv2.on(DescribeTagsCommand as any).resolves({
        TagDescriptions: [
          {
            ResourceArn:
              'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
            Tags: [
              {
                Key: 'Environment',
                Value: 'production//staging',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeTagsCommandOutput);
    });

    it('creates load balancer with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSLoadBalancerProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-load-balancer-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'load-balancer',
              },
              metadata: expect.objectContaining({
                name: 'my-load-balancer',
                title: 'my-load-balancer',
                dnsName:
                  'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
                scheme: 'internet-facing',
                vpcId: 'vpc-12345678',
                type: 'application',
                state: 'active',
                availabilityZones: 'eu-west-1a',
                labels: {
                  Environment: 'production//staging',
                },
                annotations: expect.objectContaining({
                  'amazonaws.com/load-balancer-arn':
                    'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
                  'amazonaws.com/load-balancer-dns-name':
                    'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
                  'backstage.io/managed-by-location':
                    'aws-load-balancer-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-load-balancer-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#LoadBalancers:loadBalancerId=50dc6c495c0c9188;sort=loadBalancerName',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a load balancer with Name tag', () => {
    beforeEach(() => {
      elbv2.on(DescribeLoadBalancersCommand as any).resolves({
        LoadBalancers: [
          {
            LoadBalancerArn:
              'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
            LoadBalancerName: 'my-load-balancer',
            DNSName: 'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
            Scheme: 'internal',
            VpcId: 'vpc-12345678',
            Type: 'network',
            State: {
              Code: 'provisioning',
            },
          },
        ],
        $metadata: {},
      } as DescribeLoadBalancersCommandOutput);

      elbv2.on(DescribeTagsCommand as any).resolves({
        TagDescriptions: [
          {
            ResourceArn:
              'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
            Tags: [
              {
                Key: 'Name',
                Value: 'My Custom Load Balancer',
              },
              {
                Key: 'Team',
                Value: 'backend-team',
              },
            ],
          },
        ],
        $metadata: {},
      } as DescribeTagsCommandOutput);
    });

    it('creates load balancer with Name tag as title', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSLoadBalancerProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-load-balancer-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'load-balancer',
              },
              metadata: expect.objectContaining({
                name: 'my-load-balancer',
                title: 'My Custom Load Balancer',
                dnsName:
                  'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
                scheme: 'internal',
                vpcId: 'vpc-12345678',
                type: 'network',
                state: 'provisioning',
                labels: {
                  Name: 'My Custom Load Balancer',
                  Team: 'backend-team',
                },
                annotations: expect.objectContaining({
                  'amazonaws.com/load-balancer-arn':
                    'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/my-load-balancer/50dc6c495c0c9188',
                  'amazonaws.com/load-balancer-dns-name':
                    'my-load-balancer-1234567890.eu-west-1.elb.amazonaws.com',
                  'backstage.io/managed-by-location':
                    'aws-load-balancer-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-load-balancer-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#LoadBalancers:loadBalancerId=50dc6c495c0c9188;sort=loadBalancerName',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
