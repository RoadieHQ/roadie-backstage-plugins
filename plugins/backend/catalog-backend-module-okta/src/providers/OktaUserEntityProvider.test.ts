/*
 * Copyright 2022 Larder Software Limited
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

import { OktaUserEntityProvider } from './OktaUserEntityProvider';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { MockOktaCollection } from '../test-utls';
import { createLogger } from 'winston';

let listUsers: () => MockOktaCollection = () => {
  return new MockOktaCollection([]);
};
jest.mock('@okta/okta-sdk-nodejs', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        listUsers,
      };
    }),
  };
});

const logger = createLogger();

describe('OktaUserEntityProvider', () => {
  const config = new ConfigReader({
    orgUrl: 'https://okta',
    token: 'secret',
  });

  describe('where there is no users', () => {
    beforeEach(() => {
      listUsers = () => new MockOktaCollection([]);
    });

    it('creates no okta users', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, { logger });
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
      listUsers = () => {
        return new MockOktaCollection([
          {
            id: '123Test',
            profile: {
              email: 'fname@domain.com',
              customAttribute1: 'customValue',
            },
          },
        ]);
      };
    });

    it('creates okta users', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'User',
              metadata: expect.objectContaining({
                name: '123Test',
              }),
            }),
          }),
        ],
      });
    });

    it('allows kebab casing of the users email for the name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: 'kebab-case-email',
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'User',
              metadata: expect.objectContaining({
                name: 'fname-domain-com',
              }),
            }),
          }),
        ],
      });
    });

    it('allows stripping the domain from the users email for the name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: 'strip-domain-email',
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'User',
              metadata: expect.objectContaining({
                name: 'fname',
              }),
            }),
          }),
        ],
      });
    });
    it('allows slugifying the users email for the name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: 'slugify-email',
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'User',
              metadata: expect.objectContaining({
                name: 'fname-domain.com',
              }),
            }),
          }),
        ],
      });
    });
    it('I can customize the naming strategy', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: user => user.id,
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'User',
              metadata: expect.objectContaining({
                name: '123Test',
              }),
            }),
          }),
        ],
      });
    });

    it('Where the naming strategy fails it passes over the user', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: () => {
          throw new Error('bork');
        },
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });

    it('passes allowed profile fields to annotations', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, {
        logger,
        customAttributesToAnnotationAllowlist: ['customAttribute1'],
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'User',
              metadata: expect.objectContaining({
                annotations: expect.objectContaining({
                  customAttribute1: 'customValue',
                }),
                name: '123Test',
              }),
            }),
          }),
        ],
      });
    });

    it('uses custom user transformer', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, {
        logger,
        userTransformer: (user, namingStrategy, options) => ({
          kind: 'User',
          apiVersion: 'backstage.io/v1alpha1',
          metadata: {
            annotations: { ...options.annotations },
            name: namingStrategy(user),
            title: user.profile.email,
          },
          spec: {
            profile: {
              displayName: user.profile.displayName,
              email: user.profile.email,
              picture: 'picture.com',
            },
            memberOf: [],
          },
        }),
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'User',
              spec: expect.objectContaining({
                profile: expect.objectContaining({
                  picture: 'picture.com',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
