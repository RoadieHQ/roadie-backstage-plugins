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
  S3,
  ListBucketsCommand,
  GetBucketTaggingCommand,
} from '@aws-sdk/client-s3';
import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSS3BucketProvider } from './AWSS3BucketProvider';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const s3 = mockClient(S3);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSS3BucketProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there is no buckets', () => {
    beforeEach(() => {
      s3.on(ListBucketsCommand).resolves({
        Buckets: [],
      });
    });

    it('creates no aws buckets', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSS3BucketProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is a bucket', () => {
    beforeEach(() => {
      s3.on(ListBucketsCommand).resolves({
        Buckets: [
          {
            Name: 'my-bucket',
            CreationDate: new Date(Date.now()),
          },
        ],
      });
      s3.on(GetBucketTaggingCommand).resolves({
        TagSet: [
          {
            Key: 'owner',
            Value: 'team-storage',
          },
        ],
      });
      sts.on(GetCallerIdentityCommand).resolves({
        Account: '123456789012',
      });
    });

    it('creates aws buckets with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSS3BucketProvider.example.yaml.njs'),
      ).toString();
      const provider = AWSS3BucketProvider.fromConfig(config, {
        logger,
        template,
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates aws buckets', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSS3BucketProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });
  });
});
