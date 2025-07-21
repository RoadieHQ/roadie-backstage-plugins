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
  OpenSearch,
  ListDomainNamesCommand,
  DescribeDomainCommand,
  ListTagsCommand,
  ListDomainNamesCommandOutput,
  DescribeDomainCommandOutput,
  ListTagsCommandOutput,
} from '@aws-sdk/client-opensearch';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSOpenSearchEntityProvider } from './AWSOpenSearchEntityProvider';
import { ANNOTATION_AWS_OPEN_SEARCH_ARN } from '../annotations';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

// @ts-ignore
const opensearch = mockClient(OpenSearch);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSOpenSearchEntityProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there are no domains', () => {
    beforeEach(() => {
      // @ts-ignore
      opensearch.on(ListDomainNamesCommand).resolves({
        DomainNames: [],
      } as ListDomainNamesCommandOutput);
    });

    it('creates no domains', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOpenSearchEntityProvider.fromConfig(config, {
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

  describe('where there is an OpenSearch domain', () => {
    beforeEach(() => {
      // @ts-ignore
      opensearch.on(ListDomainNamesCommand).resolves({
        DomainNames: [
          {
            DomainName: 'my-search-domain',
            EngineType: 'OpenSearch',
          },
        ],
      } as ListDomainNamesCommandOutput);
      // @ts-ignore
      opensearch.on(DescribeDomainCommand).resolves({
        DomainStatus: {
          DomainName: 'my-search-domain',
          ARN: 'arn:aws:es:eu-west-1:123456789012:domain/my-search-domain',
          Endpoint: 'search-my-search-domain-abc123.eu-west-1.es.amazonaws.com',
          EngineVersion: 'OpenSearch_2.3',
          EBSOptions: {
            EBSEnabled: true,
            VolumeType: 'gp3',
            VolumeSize: 20,
          },
        },
      } as DescribeDomainCommandOutput);

      // @ts-ignore
      opensearch.on(ListTagsCommand).resolves({
        TagList: [
          {
            Key: 'Environment',
            Value: 'production//staging',
          },
          {
            Key: 'Team',
            Value: 'search-team',
          },
        ],
      } as ListTagsCommandOutput);
    });

    it('creates domain with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(
          dirname(__filename),
          './AWSOpenSearchEntityProvider.example.yaml.njs',
        ),
      ).toString();
      const provider = AWSOpenSearchEntityProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-opensearch-domain-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                type: 'opensearch-domain',
              },
              metadata: expect.objectContaining({
                name: 'my-search-domain',
                title: 'my-search-domain',
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_OPEN_SEARCH_ARN]:
                    'arn:aws:es:eu-west-1:123456789012:domain/my-search-domain',
                  'backstage.io/managed-by-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                }),
                endpoint:
                  'search-my-search-domain-abc123.eu-west-1.es.amazonaws.com',
                engineVersion: 'OpenSearch_2.3',
                storageType: 'EBS-gp3',
              }),
            }),
          }),
        ],
      });
    });
    it('creates domain', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOpenSearchEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-opensearch-domain-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'opensearch-domain',
              },
              metadata: expect.objectContaining({
                name: 'my-search-domain',
                title: 'my-search-domain',
                labels: {
                  'aws-opensearch-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_OPEN_SEARCH_ARN]:
                    'arn:aws:es:eu-west-1:123456789012:domain/my-search-domain',
                  'backstage.io/managed-by-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                }),
                endpoint:
                  'search-my-search-domain-abc123.eu-west-1.es.amazonaws.com',
                engineVersion: 'OpenSearch_2.3',
                storageType: 'EBS-gp3',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is an Elasticsearch domain', () => {
    beforeEach(() => {
      // @ts-ignore
      opensearch.on(ListDomainNamesCommand).resolves({
        DomainNames: [
          {
            DomainName: 'my-elasticsearch-domain',
            EngineType: 'Elasticsearch',
          },
        ],
      } as ListDomainNamesCommandOutput);
      // @ts-ignore
      opensearch.on(DescribeDomainCommand).resolves({
        DomainStatus: {
          DomainName: 'my-elasticsearch-domain',
          ARN: 'arn:aws:es:eu-west-1:123456789012:domain/my-elasticsearch-domain',
          Endpoint:
            'search-my-elasticsearch-domain-def456.eu-west-1.es.amazonaws.com',
          EngineVersion: 'Elasticsearch_7.10',
          EBSOptions: {
            EBSEnabled: false,
          },
        },
      } as DescribeDomainCommandOutput);
      // @ts-ignore
      opensearch.on(ListTagsCommand).resolves({
        TagList: [
          {
            Key: 'Environment',
            Value: 'development',
          },
        ],
      } as ListTagsCommandOutput);
    });

    it('creates Elasticsearch domain with instance storage', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOpenSearchEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-opensearch-domain-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'opensearch-domain',
              },
              metadata: expect.objectContaining({
                name: 'my-elasticsearch-domain',
                title: 'my-elasticsearch-domain',
                labels: {
                  'aws-opensearch-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_OPEN_SEARCH_ARN]:
                    'arn:aws:es:eu-west-1:123456789012:domain/my-elasticsearch-domain',
                  'backstage.io/managed-by-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                }),
                endpoint:
                  'search-my-elasticsearch-domain-def456.eu-west-1.es.amazonaws.com',
                engineVersion: 'Elasticsearch_7.10',
                storageType: 'Instance Storage',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a domain without tags', () => {
    beforeEach(() => {
      // @ts-ignore
      opensearch.on(ListDomainNamesCommand).resolves({
        DomainNames: [
          {
            DomainName: 'my-domain-no-tags',
            EngineType: 'OpenSearch',
          },
        ],
      } as ListDomainNamesCommandOutput);
      // @ts-ignore
      opensearch.on(DescribeDomainCommand).resolves({
        DomainStatus: {
          DomainName: 'my-domain-no-tags',
          ARN: 'arn:aws:es:eu-west-1:123456789012:domain/my-domain-no-tags',
          Endpoint:
            'search-my-domain-no-tags-ghi789.eu-west-1.es.amazonaws.com',
          EngineVersion: 'OpenSearch_2.5',
          EBSOptions: {
            EBSEnabled: true,
            VolumeType: 'io1',
            VolumeSize: 100,
          },
        },
      } as DescribeDomainCommandOutput);
      // @ts-ignore
      opensearch.on(ListTagsCommand).resolves({
        TagList: [],
      } as ListTagsCommandOutput);
    });

    it('creates domain without tags', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOpenSearchEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-opensearch-domain-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'opensearch-domain',
              },
              metadata: expect.objectContaining({
                name: 'my-domain-no-tags',
                title: 'my-domain-no-tags',
                labels: {
                  'aws-opensearch-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_OPEN_SEARCH_ARN]:
                    'arn:aws:es:eu-west-1:123456789012:domain/my-domain-no-tags',
                  'backstage.io/managed-by-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                }),
                endpoint:
                  'search-my-domain-no-tags-ghi789.eu-west-1.es.amazonaws.com',
                engineVersion: 'OpenSearch_2.5',
                storageType: 'EBS-io1',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a domain with special characters in name', () => {
    beforeEach(() => {
      // @ts-ignore
      opensearch.on(ListDomainNamesCommand).resolves({
        DomainNames: [
          {
            DomainName: 'my_domain-test.123',
            EngineType: 'OpenSearch',
          },
        ],
      } as ListDomainNamesCommandOutput);
      // @ts-ignore
      opensearch.on(DescribeDomainCommand).resolves({
        DomainStatus: {
          DomainName: 'my_domain-test.123',
          ARN: 'arn:aws:es:eu-west-1:123456789012:domain/my_domain-test.123',
          Endpoint:
            'search-my-domain-test-123-jkl012.eu-west-1.es.amazonaws.com',
          EngineVersion: 'OpenSearch_2.3',
          EBSOptions: {
            EBSEnabled: true,
            VolumeType: 'gp2',
            VolumeSize: 10,
          },
        },
      } as DescribeDomainCommandOutput);
      // @ts-ignore
      opensearch.on(ListTagsCommand).resolves({
        TagList: [],
      } as ListTagsCommandOutput);
    });

    it('creates domain with normalized name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOpenSearchEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-opensearch-domain-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'opensearch-domain',
              },
              metadata: expect.objectContaining({
                name: 'my-domain-test-123',
                title: 'my_domain-test.123',
                labels: {
                  'aws-opensearch-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_OPEN_SEARCH_ARN]:
                    'arn:aws:es:eu-west-1:123456789012:domain/my_domain-test.123',
                  'backstage.io/managed-by-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-opensearch-domain-0:arn:aws:iam::123456789012:role/role1',
                }),
                endpoint:
                  'search-my-domain-test-123-jkl012.eu-west-1.es.amazonaws.com',
                engineVersion: 'OpenSearch_2.3',
                storageType: 'EBS-gp2',
              }),
            }),
          }),
        ],
      });
    });
  });
});
