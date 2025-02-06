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

import { getVoidLogger } from '@backstage/backend-common';
import { OktaEntityProvider, OktaScope } from './OktaEntityProvider';
import { AccountConfig } from '../types';
import { Client } from '@okta/okta-sdk-nodejs';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';

class ConcreteEntityProvider extends OktaEntityProvider {
  constructor(accountConfig: AccountConfig) {
    super(accountConfig, {
      logger: getVoidLogger(),
    });
  }
  getProviderName(): string {
    return 'ConcreteEntityProvider';
  }
  getClient(
    orgUrl: string,
    oauthScopes: OktaScope[] | undefined = undefined,
  ): Client {
    return super.getClient(orgUrl, oauthScopes);
  }

  run(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

jest.mock('@okta/okta-sdk-nodejs', () => {
  return {
    Client: jest.fn().mockImplementation(() => {}),
  };
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe('OktaEntityProvider', () => {
  describe('when an api token is given', () => {
    it('instantiates the okta client with an api token', async () => {
      const provider = new ConcreteEntityProvider({
        orgUrl: 'http://someorg',
        token: 'secret',
      });
      provider.getClient('http://someorg', ['okta.users.read']);

      expect(Client).toHaveBeenCalledWith({
        orgUrl: 'http://someorg',
        token: 'secret',
      });
    });
  });

  describe('when OAauth credentials are given', () => {
    it('instantiates the okta client with all required OAauth parameters', async () => {
      const provider = new ConcreteEntityProvider({
        orgUrl: 'http://someorg',
        oauth: {
          privateKey: 'some string encoded PEM or JWK',
          keyId: 'thekeyid',
          clientId: 'theclientid',
        },
      });
      provider.getClient('http://someorg', ['okta.users.read']);

      expect(Client).toHaveBeenCalledWith({
        authorizationMode: 'PrivateKey',
        clientId: 'theclientid',
        keyId: 'thekeyid',
        orgUrl: 'http://someorg',
        privateKey: 'some string encoded PEM or JWK',
        scopes: ['okta.users.read'],
      });
    });
  });

  describe('connect', () => {
    it('schedules a run after the connection is established', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };

      const provider = new ConcreteEntityProvider({
        orgUrl: 'http://someorg',
        token: 'secret',
      });

      const mockSchedule: SchedulerServiceTaskRunner = {
        run: jest.fn(),
      };

      provider.schedule(mockSchedule);
      expect(mockSchedule.run).not.toHaveBeenCalled();

      await provider.connect(entityProviderConnection);
      expect(mockSchedule.run).toHaveBeenCalledWith({
        id: 'ConcreteEntityProvider:run',
        fn: expect.any(Function),
      });
    });
  });
});
