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

import { Lambda, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-backend';
import { AWSLambdaFunctionProvider } from './AWSLambdaFunctionProvider';

const lambda = mockClient(Lambda);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSLambdaFunctionProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleArn: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there is no functions', () => {
    beforeEach(() => {
      lambda.on(ListFunctionsCommand).resolves({
        Functions: [],
      });
    });

    it('creates no aws functions', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSLambdaFunctionProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toBeCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there are is a function', () => {
    beforeEach(() => {
      lambda.on(ListFunctionsCommand).resolves({
        Functions: [
          {
            FunctionName: 'my-function',
            FunctionArn:
              'arn:aws:lambda:eu-west-1:123456789012:function:my-function',
          },
        ],
      });
    });

    it('creates aws functions', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSLambdaFunctionProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toBeCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Component',
              metadata: expect.objectContaining({
                title: 'my-function',
              }),
            }),
          }),
        ],
      });
    });
  });
});
