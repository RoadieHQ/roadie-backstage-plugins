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

import {
  Lambda,
  ListFunctionsCommand,
  ListTagsCommand,
} from '@aws-sdk/client-lambda';
import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSLambdaFunctionProvider } from './AWSLambdaFunctionProvider';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const lambda = mockClient(Lambda);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSLambdaFunctionProvider', () => {
  const ownerTag = 'Owner-test';
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
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
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there are is a function', () => {
    const owner = 'engineering';
    beforeEach(() => {
      lambda.on(ListFunctionsCommand).resolves({
        Functions: [
          {
            FunctionName: 'my-function',
            FunctionArn:
              'arn:aws:lambda:eu-west-1:123456789012:function:my-function',
            Runtime: 'nodejs14.x',
            Role: 'arn:aws:iam::123456789012:role/lambdaRole',
            Handler: 'src/functions/filename.handler',
            CodeSize: 45096642,
            Description: '',
            Timeout: 30,
            MemorySize: 1024,
            PackageType: 'Zip',
            Architectures: ['x86_64'],
            EphemeralStorage: {
              Size: 512,
            },
          },
        ],
      });
      lambda.on(ListTagsCommand).resolves({
        Tags: {
          [ownerTag]: owner,
          owner: 'wrong',
        },
      });
    });

    it('creates aws functions with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(
          dirname(__filename),
          './AWSLambdaFunctionProvider.example.yaml.njs',
        ),
      ).toString();
      const provider = AWSLambdaFunctionProvider.fromConfig(config, {
        logger,
        template,
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                annotations: {
                  'amazon.com/lambda-function-arn':
                    'arn:aws:lambda:eu-west-1:123456789012:function:my-function',
                  'backstage.io/managed-by-location':
                    'aws-lambda-function-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-lambda-function-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/functions/my-function',
                },
                title: 'my-function',
                name: 'bc6fa48d05a0a464c5e2a5214985bd957578cd50314fc6076cef1845fadb3c8',
              }),
            }),
          }),
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
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                annotations: {
                  'amazon.com/iam-role-arn':
                    'arn:aws:iam::123456789012:role/lambdaRole',
                  'amazon.com/lambda-function-arn':
                    'arn:aws:lambda:eu-west-1:123456789012:function:my-function',
                  'backstage.io/managed-by-location':
                    'aws-lambda-function-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-lambda-function-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/functions/my-function',
                },
                title: 'my-function',
                architectures: ['x86_64'],
                description: '',
                ephemeralStorage: 512,
                memorySize: 1024,
                name: 'bc6fa48d05a0a464c5e2a5214985bd957578cd50314fc6076cef1845fadb3c8',
                runtime: 'nodejs14.x',
                timeout: 30,
              }),
            }),
          }),
        ],
      });
    });

    it('maps owner from custom tag mapping', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSLambdaFunctionProvider.fromConfig(config, {
        logger,
        ownerTag,
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              spec: expect.objectContaining({
                owner: owner,
              }),
            }),
          }),
        ],
      });
    });

    it('is able to use dynamic config', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSLambdaFunctionProvider.fromConfig(config, {
        logger,
        useTemporaryCredentials: true,
      });
      await provider.connect(entityProviderConnection);
      await provider.run({
        roleArn: 'arn:aws:iam::999999999999:role/dynamic-role',
        region: 'us-east-1',
      });
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                annotations: {
                  'amazon.com/iam-role-arn':
                    'arn:aws:iam::123456789012:role/lambdaRole',
                  'amazon.com/lambda-function-arn':
                    'arn:aws:lambda:eu-west-1:123456789012:function:my-function',
                  'backstage.io/managed-by-location':
                    'aws-lambda-function-0:arn:aws:iam::999999999999:role/dynamic-role',
                  'backstage.io/managed-by-origin-location':
                    'aws-lambda-function-0:arn:aws:iam::999999999999:role/dynamic-role',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/functions/my-function',
                },
                title: 'my-function',
                architectures: ['x86_64'],
                description: '',
                ephemeralStorage: 512,
                memorySize: 1024,
                name: 'bc6fa48d05a0a464c5e2a5214985bd957578cd50314fc6076cef1845fadb3c8',
                runtime: 'nodejs14.x',
                timeout: 30,
              }),
            }),
          }),
        ],
      });
    });
  });
});
