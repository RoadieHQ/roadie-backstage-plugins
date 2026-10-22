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

import { OktaEntityProvider, OktaScope } from './OktaEntityProvider';
import { AccountConfig } from '../types';
import { Client, RequestExecutor } from '@okta/okta-sdk-nodejs';
import { createSilentLogger } from '../__testUtils__';
import { V2Configuration } from '@okta/okta-sdk-nodejs/src/types/configuration';

class ConcreteEntityProvider extends OktaEntityProvider {
  public getProviderName(): string {
    throw new Error('Method not implemented.');
  }
  constructor(
    accountConfig: AccountConfig,
    options?: {
      clientConfig?: V2Configuration;
    },
  ) {
    super(accountConfig, {
      logger: createSilentLogger(),
      clientConfig: options?.clientConfig,
    });
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
    GroupProfile: {},
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

  describe('when a custom requestExecutor is provided', () => {
    it('uses custom requestExecutor', async () => {
      const requestExecutor = {} as unknown as RequestExecutor;
      const provider = new ConcreteEntityProvider(
        {
          orgUrl: 'http://someorg',
          token: 'secret',
        },
        {
          clientConfig: { requestExecutor: requestExecutor },
        },
      );
      provider.getClient('http://someorg', ['okta.users.read']);
      expect(Client).toHaveBeenCalledWith(
        expect.objectContaining({ requestExecutor }),
      );
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
});
