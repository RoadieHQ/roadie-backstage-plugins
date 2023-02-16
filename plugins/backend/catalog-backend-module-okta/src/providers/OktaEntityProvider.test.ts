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

class ConcreteEntityProvider extends OktaEntityProvider {
  public getProviderName(): string {
    throw new Error('Method not implemented.');
  }
  constructor(accountConfig: AccountConfig) {
    super([accountConfig], {
      logger: getVoidLogger(),
    });
  }

  getClient(
    orgUrl: string,
    oauthScopes: OktaScope[] | undefined = undefined,
  ): Client {
    return super.getClient(orgUrl, oauthScopes);
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

      expect(Client).toBeCalledWith({
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

      expect(Client).toBeCalledWith({
        authorizationMode: 'PrivateKey',
        clientId: 'theclientid',
        keyId: 'thekeyid',
        orgUrl: 'http://someorg',
        privateKey: 'some string encoded PEM or JWK',
        scopes: ['okta.users.read'],
      });
    });
  });
});
