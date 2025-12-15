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
import {
  DescribeRepositoriesCommand,
  DescribeRepositoriesCommandOutput,
  ECRClient,
  ListTagsForResourceCommand,
  ListTagsForResourceCommandOutput,
} from '@aws-sdk/client-ecr';
import { GetCallerIdentityCommand, STS } from '@aws-sdk/client-sts';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';

import { AWSECRRepositoryEntityProvider } from './AWSECRRepositoryEntityProvider';
import template from './AWSECRRepositoryEntityProvider.example.yaml.njk';

// @ts-ignore
const ecr = mockClient(ECRClient);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSECRRepositoryEntityProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });
  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({
      Account: '123456789012',
    });
  });

  describe('where there are no repositories', () => {
    beforeEach(() => {
      // @ts-ignore
      ecr.on(DescribeRepositoriesCommand).resolves({
        repositories: [],
      } as DescribeRepositoriesCommandOutput);
    });

    it('creates no repositories', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSECRRepositoryEntityProvider.fromConfig(config, {
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

  describe('where there is a repository', () => {
    beforeEach(() => {
      // @ts-ignore
      ecr.on(DescribeRepositoriesCommand).resolves({
        repositories: [
          {
            repositoryName: 'my-app-repo',
            repositoryArn:
              'arn:aws:ecr:eu-west-1:123456789012:repository/my-app-repo',
            repositoryUri:
              '123456789012.dkr.ecr.eu-west-1.amazonaws.com/my-app-repo',
            imageTagMutability: 'MUTABLE',
            createdAt: new Date('2023-01-01T00:00:00Z'),
            encryptionConfiguration: {
              encryptionType: 'AES256',
            },
          },
        ],
      } as DescribeRepositoriesCommandOutput);
      // @ts-ignore
      ecr.on(ListTagsForResourceCommand).resolves({
        tags: [
          {
            Key: 'owner',
            Value: 'team-platform',
          },
          {
            Key: 'Environment',
            Value: 'production//staging',
          },
        ],
      } as ListTagsForResourceCommandOutput);
    });

    it('creates repository with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSECRRepositoryEntityProvider.fromConfig(config, {
        logger,
        template,
      });
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
      const provider = AWSECRRepositoryEntityProvider.fromConfig(config, {
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

    it('creates repository', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSECRRepositoryEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });
  });

  describe('where there is a repository and I have a value mapper', () => {
    beforeEach(() => {
      // @ts-ignore
      ecr.on(DescribeRepositoriesCommand).resolves({
        repositories: [
          {
            repositoryName: 'my-app-repo',
            repositoryArn:
              'arn:aws:ecr:eu-west-1:123456789012:repository/my-app-repo',
            repositoryUri:
              '123456789012.dkr.ecr.eu-west-1.amazonaws.com/my-app-repo',
            imageTagMutability: 'IMMUTABLE',
            createdAt: new Date('2023-01-01T00:00:00Z'),
            encryptionConfiguration: {
              encryptionType: 'KMS',
            },
          },
        ],
      } as DescribeRepositoriesCommandOutput);
      // @ts-ignore
      ecr.on(ListTagsForResourceCommand).resolves({
        tags: [
          {
            Key: 'Environment',
            Value: 'production//staging',
          },
        ],
      } as ListTagsForResourceCommandOutput);
    });

    it('creates repository with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSECRRepositoryEntityProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-ecr-repo-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'ecr-repository',
              },
              metadata: expect.objectContaining({
                name: 'my-app-repo',
                title: 'my-app-repo',
                labels: {
                  'aws-ecr-region': 'eu-west-1',
                  Environment: 'production//staging',
                },
                annotations: expect.objectContaining({
                  'amazonaws.com/ecr-repository-arn':
                    'arn:aws:ecr:eu-west-1:123456789012:repository/my-app-repo',
                  'backstage.io/managed-by-location':
                    'aws-ecr-repo-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-ecr-repo-0:arn:aws:iam::123456789012:role/role1',
                }),
                uri: '123456789012.dkr.ecr.eu-west-1.amazonaws.com/my-app-repo',
                tagImmutability: 'IMMUTABLE',
                createdAt: 'Sun Jan 01 2023',
                encryption: 'KMS',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a repository with special characters in name', () => {
    beforeEach(() => {
      // @ts-ignore
      ecr.on(DescribeRepositoriesCommand).resolves({
        repositories: [
          {
            repositoryName: 'my_app/repo-test',
            repositoryArn:
              'arn:aws:ecr:eu-west-1:123456789012:repository/my_app/repo-test',
            repositoryUri:
              '123456789012.dkr.ecr.eu-west-1.amazonaws.com/my_app/repo-test',
          },
        ],
      } as DescribeRepositoriesCommandOutput);
      // @ts-ignore
      ecr.on(ListTagsForResourceCommand).resolves({
        tags: [],
      } as ListTagsForResourceCommandOutput);
    });

    it('creates repository with normalized name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSECRRepositoryEntityProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();

      // Only validate the name normalization - the key property being tested
      const call = (entityProviderConnection.applyMutation as jest.Mock).mock
        .calls[0][0];
      expect(call.entities[0].entity.metadata.name).toBe('my_app-repo-test');
      expect(call.entities[0].entity.metadata.title).toBe('my_app/repo-test');
    });
  });

  describe('where there is a repository with dynamic account config', () => {
    beforeEach(() => {
      // @ts-ignore
      ecr.on(DescribeRepositoriesCommand).resolves({
        repositories: [
          {
            repositoryName: 'my-app-repo',
            repositoryArn:
              'arn:aws:ecr:us-east-1:999888777666:repository/my-app-repo',
            repositoryUri:
              '999888777666.dkr.ecr.us-east-1.amazonaws.com/my-app-repo',
            imageTagMutability: 'MUTABLE',
            createdAt: new Date('2023-01-01T00:00:00Z'),
            encryptionConfiguration: {
              encryptionType: 'AES256',
            },
          },
        ],
      } as DescribeRepositoriesCommandOutput);
      // @ts-ignore
      ecr.on(ListTagsForResourceCommand).resolves({
        tags: [
          {
            Key: 'owner',
            Value: 'team-platform',
          },
        ],
      } as ListTagsForResourceCommandOutput);

      // Mock STS to return dynamic account
      sts.on(GetCallerIdentityCommand).resolves({
        Account: '999888777666',
      });
    });

    it('creates repository with different region and accountId from dynamic config', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };

      const dynamicRoleArn = 'arn:aws:iam::999888777666:role/dynamic-role';
      const dynamicRegion = 'us-east-1';
      const dynamicAccountId = '999888777666';

      const provider = AWSECRRepositoryEntityProvider.fromConfig(config, {
        logger,
        taskRunner: {
          run: async task => {
            await task.fn({
              roleArn: dynamicRoleArn,
              region: dynamicRegion,
            } as any);
          },
        },
        useTemporaryCredentials: true,
      });

      await provider.connect(entityProviderConnection);

      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              metadata: expect.objectContaining({
                name: 'my-app-repo', // Stable identifier for clarity
                annotations: expect.objectContaining({
                  // Validates roleArn from dynamic config is used
                  'backstage.io/managed-by-location': `aws-ecr-repo-0:${dynamicRoleArn}`,
                  'backstage.io/managed-by-origin-location': `aws-ecr-repo-0:${dynamicRoleArn}`,
                  // Validates accountId (derived from roleArn) from dynamic config is used
                  'amazon.com/account-id': dynamicAccountId,
                }),
                labels: expect.objectContaining({
                  // Validates region from dynamic config is used
                  'aws-ecr-region': dynamicRegion,
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
