/*
 * Copyright 2021 Larder Software Limited
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

import { IAM, ListRolesCommand, Role } from '@aws-sdk/client-iam';
import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { AWSIAMRoleProvider } from './AWSIAMRoleProvider';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';

const iam = mockClient(IAM);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSIAMRoleProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there is no users', () => {
    beforeEach(() => {
      iam.on(ListRolesCommand).resolves({
        Roles: [],
      });
    });

    it('creates no aws users', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSIAMRoleProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there are is a user', () => {
    beforeEach(() => {
      iam.on(ListRolesCommand).resolves({
        Roles: [
          {
            RoleId: 'asdfewfwef',
            RoleName: 'adsf',
            Arn: 'arn:aws:iam::123456789012:role/asdf',
            Tags: [{ Key: 'owner', Value: 'team-a' }],
          } as Partial<Role> as any,
        ],
      });
    });

    it('creates aws users with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSIAMRoleProvider.example.yaml.njs'),
      ).toString();
      const provider = AWSIAMRoleProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates aws users', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSIAMRoleProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
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
      const provider = AWSIAMRoleProvider.fromConfig(config, {
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

  describe('where there is a role with dynamic account config', () => {
    beforeEach(() => {
      iam.on(ListRolesCommand).resolves({
        Roles: [
          {
            RoleId: 'AIDACKCEVSQ6C2EXAMPLE',
            RoleName: 'dynamic-test-role',
            Arn: 'arn:aws:iam::999888777666:role/dynamic-test-role',
            Tags: [{ Key: 'owner', Value: 'team-platform' }],
          } as Partial<Role> as any,
        ],
      });
      sts.on(GetCallerIdentityCommand).resolves({
        Account: '999888777666',
      });
    });

    it('creates role with different accountId and roleArn from dynamic config', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };

      const dynamicRoleArn =
        'arn:aws:iam::999888777666:role/dynamic-execution-role';
      const dynamicRegion = 'us-west-2';
      const dynamicAccountId = '999888777666';

      const provider = AWSIAMRoleProvider.fromConfig(config, {
        logger,
        useTemporaryCredentials: true,
      });
      provider.connect(entityProviderConnection);
      await provider.run({
        roleArn: dynamicRoleArn,
        region: dynamicRegion,
      });

      const mutation = (entityProviderConnection.applyMutation as jest.Mock)
        .mock.calls[0][0];
      expect(mutation.type).toBe('full');
      expect(mutation.entities).toHaveLength(1);

      const { entity } = mutation.entities[0];

      expect(entity.metadata.title).toBe('dynamic-test-role');

      expect(
        entity.metadata.annotations['backstage.io/managed-by-location'],
      ).toBe(`aws-iam-role-0:${dynamicRoleArn}`);
      expect(
        entity.metadata.annotations['backstage.io/managed-by-origin-location'],
      ).toBe(`aws-iam-role-0:${dynamicRoleArn}`);

      expect(entity.metadata.annotations['amazon.com/account-id']).toBe(
        dynamicAccountId,
      );
    });
  });
});
