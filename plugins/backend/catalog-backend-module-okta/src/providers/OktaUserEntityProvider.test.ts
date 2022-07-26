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

import { OktaUserEntityProvider } from './OktaUserEntityProvider';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-backend';
import { MockOktaCollection } from '../test-utls';
import { getVoidLogger } from '@backstage/backend-common';

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

const logger = getVoidLogger();

describe('AWSIAMUserProvider', () => {
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
      };
      const provider = OktaUserEntityProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toBeCalledWith({
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
            id: 'asdfwefwefwef',
            profile: {
              email: 'fname@domain.com',
            },
          },
        ]);
      };
    });

    it('creates okta users', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
      };
      const provider = OktaUserEntityProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toBeCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'User',
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
