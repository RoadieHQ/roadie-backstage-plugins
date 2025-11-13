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
  ElastiCache,
  DescribeCacheClustersCommand,
  ListTagsForResourceCommand,
  DescribeCacheClustersCommandOutput,
  ListTagsForResourceCommandOutput,
} from '@aws-sdk/client-elasticache';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSElastiCacheEntityProvider } from './AWSElastiCacheEntityProvider';
import { ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN } from '../annotations';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

// @ts-ignore
const elasticache = mockClient(ElastiCache);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSElastiCacheEntityProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there are no clusters', () => {
    beforeEach(() => {
      // @ts-ignore
      elasticache.on(DescribeCacheClustersCommand).resolves({
        CacheClusters: [],
      } as DescribeCacheClustersCommandOutput);
    });

    it('creates no clusters', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSElastiCacheEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is a Redis cluster', () => {
    beforeEach(() => {
      // @ts-ignore
      elasticache.on(DescribeCacheClustersCommand).resolves({
        CacheClusters: [
          {
            CacheClusterId: 'my-redis-cluster',
            ARN: 'arn:aws:elasticache:eu-west-1:123456789012:cluster:my-redis-cluster',
            CacheClusterStatus: 'available',
            Engine: 'redis',
            EngineVersion: '7.0.7',
            CacheNodeType: 'cache.t3.micro',
            CacheNodes: [
              {
                Endpoint: {
                  Address: 'my-redis-cluster.abc123.cache.amazonaws.com',
                  Port: 6379,
                },
              },
            ],
          },
        ],
      } as DescribeCacheClustersCommandOutput);
      // @ts-ignore
      elasticache.on(ListTagsForResourceCommand).resolves({
        TagList: [
          {
            Key: 'Environment',
            Value: 'production//staging',
          },
        ],
      } as ListTagsForResourceCommandOutput);
    });

    it('creates cluster with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(
          dirname(__filename),
          './AWSElastiCacheEntityProvider.example.yaml.njk',
        ),
      ).toString();
      const provider = AWSElastiCacheEntityProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates cluster', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSElastiCacheEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });
  });

  describe('where there is a Memcached cluster', () => {
    beforeEach(() => {
      // @ts-ignore
      elasticache.on(DescribeCacheClustersCommand).resolves({
        CacheClusters: [
          {
            CacheClusterId: 'my-memcached-cluster',
            ARN: 'arn:aws:elasticache:eu-west-1:123456789012:cluster:my-memcached-cluster',
            CacheClusterStatus: 'creating',
            Engine: 'memcached',
            EngineVersion: '1.6.17',
            CacheNodeType: 'cache.r6g.large',
            CacheNodes: [
              {
                Endpoint: {
                  Address: 'my-memcached-cluster.abc123.cache.amazonaws.com',
                  Port: 11211,
                },
              },
            ],
          },
        ],
      } as DescribeCacheClustersCommandOutput);
      // @ts-ignore
      elasticache.on(ListTagsForResourceCommand).resolves({
        TagList: [
          {
            Key: 'Team',
            Value: 'backend-team',
          },
        ],
      } as ListTagsForResourceCommandOutput);
    });

    it('creates memcached cluster', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSElastiCacheEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-elasticache-cluster-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'elasticache-cluster',
              },
              metadata: expect.objectContaining({
                name: 'my-memcached-cluster',
                title: 'my-memcached-cluster',
                labels: {
                  'aws-elasticache-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN]:
                    'arn:aws:elasticache:eu-west-1:123456789012:cluster:my-memcached-cluster',
                  'backstage.io/managed-by-location':
                    'aws-elasticache-cluster-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-elasticache-cluster-0:arn:aws:iam::123456789012:role/role1',
                }),
                status: 'creating',
                engine: 'memcached',
                engineVersion: '1.6.17',
                nodeType: 'cache.r6g.large',
                endpoint:
                  'my-memcached-cluster.abc123.cache.amazonaws.com:11211',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a cluster without endpoint', () => {
    beforeEach(() => {
      // @ts-ignore
      elasticache.on(DescribeCacheClustersCommand).resolves({
        CacheClusters: [
          {
            CacheClusterId: 'my-cluster-no-endpoint',
            ARN: 'arn:aws:elasticache:eu-west-1:123456789012:cluster:my-cluster-no-endpoint',
            CacheClusterStatus: 'creating',
            Engine: 'redis',
            EngineVersion: '7.0.7',
            CacheNodeType: 'cache.t3.micro',
            CacheNodes: [],
          },
        ],
      } as DescribeCacheClustersCommandOutput);
      // @ts-ignore
      elasticache.on(ListTagsForResourceCommand).resolves({
        TagList: [],
      } as ListTagsForResourceCommandOutput);
    });

    it('creates cluster with empty endpoint', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSElastiCacheEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-elasticache-cluster-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'elasticache-cluster',
              },
              metadata: expect.objectContaining({
                name: 'my-cluster-no-endpoint',
                title: 'my-cluster-no-endpoint',
                labels: {
                  'aws-elasticache-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN]:
                    'arn:aws:elasticache:eu-west-1:123456789012:cluster:my-cluster-no-endpoint',
                  'backstage.io/managed-by-location':
                    'aws-elasticache-cluster-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-elasticache-cluster-0:arn:aws:iam::123456789012:role/role1',
                }),
                status: 'creating',
                engine: 'redis',
                engineVersion: '7.0.7',
                nodeType: 'cache.t3.micro',
                endpoint: '',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a cluster with special characters in name', () => {
    beforeEach(() => {
      // @ts-ignore
      elasticache.on(DescribeCacheClustersCommand).resolves({
        CacheClusters: [
          {
            CacheClusterId: 'my_cluster-test.123',
            ARN: 'arn:aws:elasticache:eu-west-1:123456789012:cluster:my_cluster-test.123',
            CacheClusterStatus: 'available',
            Engine: 'redis',
            EngineVersion: '7.0.7',
            CacheNodeType: 'cache.t3.micro',
          },
        ],
      } as DescribeCacheClustersCommandOutput);
      // @ts-ignore
      elasticache.on(ListTagsForResourceCommand).resolves({
        TagList: [],
      } as ListTagsForResourceCommandOutput);
    });

    it('creates cluster with normalized name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSElastiCacheEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-elasticache-cluster-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'elasticache-cluster',
              },
              metadata: expect.objectContaining({
                name: 'my-cluster-test-123',
                title: 'my_cluster-test.123',
                labels: {
                  'aws-elasticache-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN]:
                    'arn:aws:elasticache:eu-west-1:123456789012:cluster:my_cluster-test.123',
                  'backstage.io/managed-by-location':
                    'aws-elasticache-cluster-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-elasticache-cluster-0:arn:aws:iam::123456789012:role/role1',
                }),
                status: 'available',
                engine: 'redis',
                engineVersion: '7.0.7',
                nodeType: 'cache.t3.micro',
                endpoint: '',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a cluster with dynamic account config', () => {
    beforeEach(() => {
      // @ts-ignore
      elasticache.on(DescribeCacheClustersCommand).resolves({
        CacheClusters: [
          {
            CacheClusterId: 'dynamic-cluster',
            ARN: 'arn:aws:elasticache:us-west-2:888777666555:cluster:dynamic-cluster',
            CacheClusterStatus: 'available',
            Engine: 'redis',
            EngineVersion: '7.0.7',
            CacheNodeType: 'cache.t3.micro',
            CacheNodes: [
              {
                Endpoint: {
                  Address: 'dynamic-cluster.xyz789.cache.amazonaws.com',
                  Port: 6379,
                },
              },
            ],
          },
        ],
      } as DescribeCacheClustersCommandOutput);
      // @ts-ignore
      elasticache.on(ListTagsForResourceCommand).resolves({
        TagList: [],
      } as ListTagsForResourceCommandOutput);
      sts.on(GetCallerIdentityCommand).resolves({
        Account: '888777666555',
      });
    });

    it('creates cluster with different region and accountId from dynamic config', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };

      const dynamicRoleArn = 'arn:aws:iam::888777666555:role/dynamic-role';
      const dynamicRegion = 'us-west-2';
      const dynamicAccountId = '888777666555';

      const provider = AWSElastiCacheEntityProvider.fromConfig(config, {
        logger,
        useTemporaryCredentials: true,
      });
      await provider.connect(entityProviderConnection);
      await provider.run({
        roleArn: dynamicRoleArn,
        region: dynamicRegion,
      });

      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-elasticache-cluster-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'elasticache-cluster',
              },
              metadata: expect.objectContaining({
                labels: {
                  'aws-elasticache-region': dynamicRegion,
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN]:
                    'arn:aws:elasticache:us-west-2:888777666555:cluster:dynamic-cluster',
                  // Validates roleArn from dynamic config is used
                  'backstage.io/managed-by-location': `aws-elasticache-cluster-0:${dynamicRoleArn}`,
                  'backstage.io/managed-by-origin-location': `aws-elasticache-cluster-0:${dynamicRoleArn}`,
                  // Validates accountId (derived from roleArn) from dynamic config is used
                  'amazon.com/account-id': dynamicAccountId,
                }),
                name: 'dynamic-cluster',
              }),
            }),
          }),
        ],
      });
    });
  });
});
