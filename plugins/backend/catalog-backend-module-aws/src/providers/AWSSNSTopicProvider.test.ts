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
  SNS,
  ListTopicsCommand,
  Topic,
  ListTagsForResourceCommand,
} from '@aws-sdk/client-sns';
import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { AWSSNSTopicProvider } from './AWSSNSTopicProvider';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

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

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
    sns.reset(); // Ensure the mock client is reset before each test
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
      const provider = AWSSNSTopicProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
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
        Tags: [
          {
            Key: 'owner',
            Value: 'team-messaging',
          },
        ],
      });
    });

    it('creates SNS topic entities with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSSNSTopicProvider.example.yaml.njk'),
      ).toString();
      const provider = AWSSNSTopicProvider.fromConfig(config, {
        logger,
        template,
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates SNS topic entities', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSNSTopicProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });
  });
});
