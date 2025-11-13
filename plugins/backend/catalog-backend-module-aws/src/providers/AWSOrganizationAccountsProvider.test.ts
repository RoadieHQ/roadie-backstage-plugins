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
  OrganizationsClient,
  ListAccountsCommand,
  ListTagsForResourceCommand,
  ListAccountsCommandOutput,
  ListTagsForResourceCommandOutput,
} from '@aws-sdk/client-organizations';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSOrganizationAccountsProvider } from './AWSOrganizationAccountsProvider';
import {
  ANNOTATION_ACCOUNT_ID,
  ANNOTATION_AWS_ACCOUNT_ARN,
} from '../annotations';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const organizations = mockClient(OrganizationsClient);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSOrganizationAccountsProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'us-east-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there are no accounts', () => {
    beforeEach(() => {
      organizations.on(ListAccountsCommand).resolves({
        Accounts: [],
        $metadata: {},
      } as ListAccountsCommandOutput);
    });

    it('creates no accounts', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOrganizationAccountsProvider.fromConfig(config, {
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

  describe('where there is an account', () => {
    beforeEach(() => {
      organizations.on(ListAccountsCommand).resolves({
        Accounts: [
          {
            Id: '123456789012',
            Arn: 'arn:aws:organizations::123456789012:account/o-example123456/123456789012',
            Email: 'test@example.com',
            Name: 'Test Account',
            Status: 'ACTIVE',
            JoinedMethod: 'INVITED',
            JoinedTimestamp: new Date('2023-01-01T00:00:00Z'),
          },
        ],
        $metadata: {},
      } as ListAccountsCommandOutput);

      organizations.on(ListTagsForResourceCommand).resolves({
        Tags: [
          {
            Key: 'Environment',
            Value: 'production//staging',
          },
          {
            Key: 'owner',
            Value: 'team-platform',
          },
        ],
        $metadata: {},
      } as ListTagsForResourceCommandOutput);
    });

    it('creates account with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(
          dirname(__filename),
          './AWSOrganizationAccountsProvider.example.yaml.njk',
        ),
      ).toString();
      const provider = AWSOrganizationAccountsProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates account', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOrganizationAccountsProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });
  });

  describe('where there is an account with Name tag', () => {
    beforeEach(() => {
      organizations.on(ListAccountsCommand).resolves({
        Accounts: [
          {
            Id: '123456789012',
            Arn: 'arn:aws:organizations::123456789012:account/o-example123456/123456789012',
            Email: 'test@example.com',
            Name: 'Test Account',
            Status: 'ACTIVE',
            JoinedMethod: 'INVITED',
            JoinedTimestamp: new Date('2023-01-01T00:00:00Z'),
          },
        ],
        $metadata: {},
      } as ListAccountsCommandOutput);

      organizations.on(ListTagsForResourceCommand).resolves({
        Tags: [
          {
            Key: 'Name',
            Value: 'My Custom Account',
          },
          {
            Key: 'Team',
            Value: 'backend-team',
          },
        ],
        $metadata: {},
      } as ListTagsForResourceCommandOutput);
    });

    it('creates account with tags', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOrganizationAccountsProvider.fromConfig(config, {
        logger,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-organization-accounts-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'aws-account',
              },
              metadata: expect.objectContaining({
                name: expect.any(String),
                title: 'Test Account',
                joinedTimestamp: '2023-01-01T00:00:00.000Z',
                joinedMethod: 'INVITED',
                status: 'ACTIVE',
                labels: {
                  Name: 'My-Custom-Account',
                  Team: 'backend-team',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_ACCOUNT_ARN]:
                    'arn:aws:organizations::123456789012:account/o-example123456/123456789012',
                  [ANNOTATION_ACCOUNT_ID]: '123456789012',
                  'backstage.io/managed-by-location':
                    'aws-organization-accounts-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-organization-accounts-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is an account and I have a value mapper', () => {
    beforeEach(() => {
      organizations.on(ListAccountsCommand).resolves({
        Accounts: [
          {
            Id: '123456789012',
            Arn: 'arn:aws:organizations::123456789012:account/o-example123456/123456789012',
            Email: 'test@example.com',
            Name: 'Test Account',
            Status: 'ACTIVE',
            JoinedMethod: 'INVITED',
            JoinedTimestamp: new Date('2023-01-01T00:00:00Z'),
          },
        ],
        $metadata: {},
      } as ListAccountsCommandOutput);

      organizations.on(ListTagsForResourceCommand).resolves({
        Tags: [
          {
            Key: 'Environment',
            Value: 'production//staging',
          },
        ],
        $metadata: {},
      } as ListTagsForResourceCommandOutput);
    });

    it('creates account with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSOrganizationAccountsProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-organization-accounts-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'aws-account',
              },
              metadata: expect.objectContaining({
                name: expect.any(String),
                title: 'Test Account',
                joinedTimestamp: '2023-01-01T00:00:00.000Z',
                joinedMethod: 'INVITED',
                status: 'ACTIVE',
                labels: {
                  Environment: 'production//staging',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_ACCOUNT_ARN]:
                    'arn:aws:organizations::123456789012:account/o-example123456/123456789012',
                  [ANNOTATION_ACCOUNT_ID]: '123456789012',
                  'backstage.io/managed-by-location':
                    'aws-organization-accounts-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-organization-accounts-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
