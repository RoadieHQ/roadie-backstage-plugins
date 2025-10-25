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

import { ListBucketsCommand, S3 } from '@aws-sdk/client-s3';
import { GetCallerIdentityCommand, STS } from '@aws-sdk/client-sts';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';

import { AWSS3BucketProvider } from './AWSS3BucketProvider';

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
  let taskRunner: SchedulerServiceTaskRunner;

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
    taskRunner = {
      run: async task => {
        await task.fn({} as any);
      },
    };
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
      const provider = AWSS3BucketProvider.fromConfig(config, {
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
        taskRunner,
      });
      await provider.connect(entityProviderConnection);
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              spec: {
                type: 's3-bucket',
                owner: 'unknown',
              },
              metadata: expect.objectContaining({
                title: 'my-bucket',
                annotations: expect.objectContaining({
                  'amazon.com/account-id': '123456789012',
                  'amazonaws.com/s3-bucket-arn': 'arn:aws:s3:::my-bucket',
                  'backstage.io/managed-by-location':
                    'aws-s3-bucket-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-s3-bucket-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });

    it('creates aws buckets', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSS3BucketProvider.fromConfig(config, {
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
                title: 'my-bucket',
                annotations: expect.objectContaining({
                  'amazon.com/account-id': '123456789012',
                  'amazon.com/s3-bucket-arn': 'arn:aws:s3:::my-bucket',
                  'backstage.io/managed-by-location':
                    'aws-s3-bucket-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-s3-bucket-0:arn:aws:iam::123456789012:role/role1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
