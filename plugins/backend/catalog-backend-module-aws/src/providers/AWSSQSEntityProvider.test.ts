/*
 * Copyright 2025 Larder Software Limited
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

import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import {
  SQS,
  ListQueuesCommand,
  GetQueueAttributesCommand,
  ListQueueTagsCommand,
  ListQueuesCommandOutput,
  GetQueueAttributesCommandOutput,
  ListQueueTagsCommandOutput,
} from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-backend';
import { AWSSQSEntityProvider } from './AWSSQSEntityProvider';
import { ANNOTATION_AWS_SQS_QUEUE_ARN } from '../annotations';

// @ts-ignore
const sqs = mockClient(SQS);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSSQSEntityProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there are no queues', () => {
    beforeEach(() => {
      // @ts-ignore
      sqs.on(ListQueuesCommand).resolves({
        QueueUrls: [],
      } as ListQueuesCommandOutput);
    });

    it('creates no queues', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSQSEntityProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there is a standard queue', () => {
    beforeEach(() => {
      // @ts-ignore
      sqs.on(ListQueuesCommand).resolves({
        QueueUrls: [
          'https://sqs.eu-west-1.amazonaws.com/123456789012/my-standard-queue',
        ],
      } as ListQueuesCommandOutput);
      // @ts-ignore
      sqs.on(GetQueueAttributesCommand).resolves({
        Attributes: {
          QueueArn: 'arn:aws:sqs:eu-west-1:123456789012:my-standard-queue',
          VisibilityTimeout: '30',
          DelaySeconds: '0',
          MaximumMessageSize: '262144',
          MessageRetentionPeriod: '1209600',
          ApproximateNumberOfMessages: '5',
        },
      } as GetQueueAttributesCommandOutput);
      // @ts-ignore
      sqs.on(ListQueueTagsCommand).resolves({
        Tags: {
          Environment: 'production//staging',
          Team: 'backend-team',
        },
      } as ListQueueTagsCommandOutput);
    });

    it('creates queue', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSQSEntityProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-sqs-queue-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'sqs-queue',
              },
              metadata: expect.objectContaining({
                name: 'my-standard-queue',
                title: 'my-standard-queue',
                labels: {
                  'aws-sqs-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_SQS_QUEUE_ARN]:
                    'arn:aws:sqs:eu-west-1:123456789012:my-standard-queue',
                  'backstage.io/managed-by-location':
                    'aws-sqs-queue-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-sqs-queue-0:arn:aws:iam::123456789012:role/role1',
                }),
                queueArn:
                  'arn:aws:sqs:eu-west-1:123456789012:my-standard-queue',
                visibilityTimeout: '30',
                delaySeconds: '0',
                maximumMessageSize: '262144',
                retentionPeriod: '1209600',
                approximateNumberOfMessages: '5',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a FIFO queue', () => {
    beforeEach(() => {
      // @ts-ignore
      sqs.on(ListQueuesCommand).resolves({
        QueueUrls: [
          'https://sqs.eu-west-1.amazonaws.com/123456789012/my-fifo-queue.fifo',
        ],
      } as ListQueuesCommandOutput);
      // @ts-ignore
      sqs.on(GetQueueAttributesCommand).resolves({
        Attributes: {
          QueueArn: 'arn:aws:sqs:eu-west-1:123456789012:my-fifo-queue.fifo',
          VisibilityTimeout: '60',
          DelaySeconds: '5',
          MaximumMessageSize: '131072',
          MessageRetentionPeriod: '604800',
          ApproximateNumberOfMessages: '0',
          FifoQueue: 'true',
          ContentBasedDeduplication: 'true',
        },
      } as GetQueueAttributesCommandOutput);

      // @ts-ignore
      sqs.on(ListQueueTagsCommand).resolves({
        Tags: {
          Environment: 'staging',
          QueueType: 'fifo',
        },
      } as ListQueueTagsCommandOutput);
    });

    it('creates FIFO queue', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSQSEntityProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-sqs-queue-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'sqs-queue',
              },
              metadata: expect.objectContaining({
                name: 'my-fifo-queue-fifo',
                title: 'my-fifo-queue.fifo',
                labels: {
                  'aws-sqs-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_SQS_QUEUE_ARN]:
                    'arn:aws:sqs:eu-west-1:123456789012:my-fifo-queue.fifo',
                  'backstage.io/managed-by-location':
                    'aws-sqs-queue-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-sqs-queue-0:arn:aws:iam::123456789012:role/role1',
                }),
                queueArn:
                  'arn:aws:sqs:eu-west-1:123456789012:my-fifo-queue.fifo',
                visibilityTimeout: '60',
                delaySeconds: '5',
                maximumMessageSize: '131072',
                retentionPeriod: '604800',
                approximateNumberOfMessages: '0',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a queue without tags', () => {
    beforeEach(() => {
      // @ts-ignore
      sqs.on(ListQueuesCommand).resolves({
        QueueUrls: [
          'https://sqs.eu-west-1.amazonaws.com/123456789012/my-queue-no-tags',
        ],
      } as ListQueuesCommandOutput);
      // @ts-ignore
      sqs.on(GetQueueAttributesCommand).resolves({
        Attributes: {
          QueueArn: 'arn:aws:sqs:eu-west-1:123456789012:my-queue-no-tags',
          VisibilityTimeout: '30',
          DelaySeconds: '0',
          MaximumMessageSize: '262144',
          MessageRetentionPeriod: '1209600',
          ApproximateNumberOfMessages: '0',
        },
      } as GetQueueAttributesCommandOutput);
      // @ts-ignore
      sqs.on(ListQueueTagsCommand).resolves({
        Tags: {},
      } as ListQueueTagsCommandOutput);
    });

    it('creates queue without tags', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSQSEntityProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-sqs-queue-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'sqs-queue',
              },
              metadata: expect.objectContaining({
                name: 'my-queue-no-tags',
                title: 'my-queue-no-tags',
                labels: {
                  'aws-sqs-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_SQS_QUEUE_ARN]:
                    'arn:aws:sqs:eu-west-1:123456789012:my-queue-no-tags',
                  'backstage.io/managed-by-location':
                    'aws-sqs-queue-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-sqs-queue-0:arn:aws:iam::123456789012:role/role1',
                }),
                queueArn: 'arn:aws:sqs:eu-west-1:123456789012:my-queue-no-tags',
                visibilityTimeout: '30',
                delaySeconds: '0',
                maximumMessageSize: '262144',
                retentionPeriod: '1209600',
                approximateNumberOfMessages: '0',
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there is a queue with special characters in name', () => {
    beforeEach(() => {
      // @ts-ignore
      sqs.on(ListQueuesCommand).resolves({
        QueueUrls: [
          'https://sqs.eu-west-1.amazonaws.com/123456789012/my_queue-test.123',
        ],
      } as ListQueuesCommandOutput);
      // @ts-ignore
      sqs.on(GetQueueAttributesCommand).resolves({
        Attributes: {
          QueueArn: 'arn:aws:sqs:eu-west-1:123456789012:my_queue-test.123',
          VisibilityTimeout: '30',
          DelaySeconds: '0',
          MaximumMessageSize: '262144',
          MessageRetentionPeriod: '1209600',
          ApproximateNumberOfMessages: '0',
        },
      } as GetQueueAttributesCommandOutput);
      // @ts-ignore
      sqs.on(ListQueueTagsCommand).resolves({
        Tags: {},
      } as ListQueueTagsCommandOutput);
    });

    it('creates queue with normalized name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSSQSEntityProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-sqs-queue-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'sqs-queue',
              },
              metadata: expect.objectContaining({
                name: 'my-queue-test-123',
                title: 'my_queue-test.123',
                labels: {
                  'aws-sqs-region': 'eu-west-1',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_SQS_QUEUE_ARN]:
                    'arn:aws:sqs:eu-west-1:123456789012:my_queue-test.123',
                  'backstage.io/managed-by-location':
                    'aws-sqs-queue-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-sqs-queue-0:arn:aws:iam::123456789012:role/role1',
                }),
                queueArn:
                  'arn:aws:sqs:eu-west-1:123456789012:my_queue-test.123',
                visibilityTimeout: '30',
                delaySeconds: '0',
                maximumMessageSize: '262144',
                retentionPeriod: '1209600',
                approximateNumberOfMessages: '0',
              }),
            }),
          }),
        ],
      });
    });
  });
});
