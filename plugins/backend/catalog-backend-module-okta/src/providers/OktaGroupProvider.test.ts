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

import { createLogger, transports } from 'winston';
import { OktaGroupProvider } from './OktaGroupProvider';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-backend';
import { MockOktaCollection } from '../test-utls';

let listGroups: () => MockOktaCollection = () => {
  return new MockOktaCollection([]);
};

jest.mock('@okta/okta-sdk-nodejs', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        listGroups,
      };
    }),
  };
});

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('OktaGroupProvider', () => {
  const config = new ConfigReader({
    orgUrl: 'https://okta',
    token: 'secret',
  });

  describe('where there is no groups', () => {
    beforeEach(() => {
      listGroups = () => new MockOktaCollection([]);
    });

    it('creates no okta groups', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
      };
      const provider = OktaGroupProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toBeCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there are is a group', () => {
    beforeEach(() => {
      listGroups = () => {
        return new MockOktaCollection([
          {
            id: 'asdfwefwefwef',
            profile: {
              name: 'Everyone',
              description: 'Everyone in the company',
            },
            listUsers: () => {
              return new MockOktaCollection([]);
            },
          },
        ]);
      };
    });

    it('creates okta groups', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
      };
      const provider = OktaGroupProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toBeCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'asdfwefwefwef',
              }),
            }),
          }),
        ],
      });
    });
  });
});
