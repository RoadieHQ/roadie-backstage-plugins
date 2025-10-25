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

import { readFileSync } from 'fs';
import { dirname, join } from 'path';

import {
  ListTagsForResourceCommand,
  ListTopicsCommand,
  SNS,
  Topic,
} from '@aws-sdk/client-sns';
import { GetCallerIdentityCommand, STS } from '@aws-sdk/client-sts';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';

import { AWSSNSTopicProvider } from './AWSSNSTopicProvider';

const sns = mockClient(SNS);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSSNSTopicProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });
  let taskRunner: SchedulerServiceTaskRunner;

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
    sns.reset(); // Ensure the mock client is reset before each test
    taskRunner = {
      run: async task => {
        await task.fn({} as any);
      },
    };
  });

  describe('when there are no SNS topics', () => {
    beforeEach(() => {
      sns.on(ListTopicsCommand).resolves({
        Topics: [],
      });
      sns.on(ListTagsForResourceCommand).resolves({
        Tags: [],
      });
    });

    it('creates no SNS topics', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSNSTopicProvider.fromConfig(config, {
        logger,
        taskRunner,
      });
      await provider.connect(entityProviderConnection);
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('when there are SNS topics', () => {
    beforeEach(() => {
      sns.on(ListTopicsCommand).resolves({
        Topics: [
          {
            TopicArn: 'arn:aws:sns:eu-west-1:123456789012:example-topic',
          } as Partial<Topic> as any,
        ],
      });
      sns.on(ListTagsForResourceCommand).resolves({
        Tags: [],
      });
    });

    it('creates SNS topic entities with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSSNSTopicProvider.example.yaml.njs'),
      ).toString();
      const provider = AWSSNSTopicProvider.fromConfig(config, {
        logger,
        template,
        taskRunner,
      });
      await provider.connect(entityProviderConnection);
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                name: 'example-topic',
                title: 'example-topic',
                annotations: expect.objectContaining({
                  'backstage.io/view-url':
                    'https://console.aws.amazon.com/sns/v3/home?region=eu-west-1#/topic/arn:aws:sns:eu-west-1:123456789012:example-topic',
                }),
              }),
            }),
          }),
        ],
      });
    });

    it('creates SNS topic entities', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSNSTopicProvider.fromConfig(config, {
        logger,
        taskRunner,
      });
      await provider.connect(entityProviderConnection);
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                name: 'example-topic',
                title: 'example-topic',
                annotations: expect.objectContaining({
                  'backstage.io/view-url':
                    'https://console.aws.amazon.com/sns/v3/home?region=eu-west-1#/topic/arn:aws:sns:eu-west-1:123456789012:example-topic',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
