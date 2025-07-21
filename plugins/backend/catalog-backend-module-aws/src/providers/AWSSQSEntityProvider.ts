/*
 * Copyright 2024 Larder Software Limited
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
import { Entity } from '@backstage/catalog-model';
import { SQS, paginateListQueues } from '@aws-sdk/client-sqs';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { AccountConfig, DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';
import { ANNOTATION_AWS_SQS_QUEUE_ARN } from '../annotations';

/**
 * Provides entities from AWS SQS service.
 */
export class AWSSQSEntityProvider extends AWSEntityProvider {
  private readonly queueTypeValue: string;

  static fromConfig(
    config: Config,
    options: {
      logger: Logger | LoggerService;
      template?: string;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
    },
  ) {
    const accountId = config.getString('accountId');
    const roleName = config.getString('roleName');
    const roleArn = config.getOptionalString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSSQSEntityProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  constructor(
    account: AccountConfig,
    options: {
      logger: Logger | LoggerService;
      template?: string;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
    },
  ) {
    super(account, options);
    this.queueTypeValue = 'sqs-queue';
  }

  getProviderName(): string {
    return `aws-sqs-queue-${this.providerId ?? 0}`;
  }

  private async getSQSClient(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new SQS({ credentials, region })
      : new SQS({ region, ...credentials });
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const startTimestamp = process.hrtime();
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);

    this.logger.info(`Providing SQS queue resources from AWS: ${accountId}`);
    const entities: Entity[] = [];

    const sqs = await this.getSQSClient(dynamicAccountConfig);

    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

    const paginator = paginateListQueues({ client: sqs }, {});
    for await (const page of paginator) {
      if (page.QueueUrls) {
        for (const queueUrl of page.QueueUrls) {
          const attributes = await sqs.getQueueAttributes({
            QueueUrl: queueUrl,
            AttributeNames: ['All'],
          });

          const tagsResponse = await sqs.listQueueTags({ QueueUrl: queueUrl });
          const tags = tagsResponse.Tags || {};

          const queueArn = attributes.Attributes?.QueueArn;
          const queueName = queueArn?.split(':').slice(-1)[0] || 'unknown';

          const visibilityTimeout =
            attributes.Attributes?.VisibilityTimeout || '';
          const delaySeconds = attributes.Attributes?.DelaySeconds || '';
          const maximumMessageSize =
            attributes.Attributes?.MaximumMessageSize || '';
          const retentionPeriod =
            attributes.Attributes?.MessageRetentionPeriod || '';
          const approximateNumberOfMessages =
            attributes.Attributes?.ApproximateNumberOfMessages || '';

          let entity = this.renderEntity(
            { queueAttributes: attributes },
            { defaultAnnotations },
          );

          if (!entity) {
            entity = {
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              metadata: {
                name: queueName.toLowerCase().replace(/[^a-zA-Z0-9\-]/g, '-'),
                title: queueName,
                labels: {
                  'aws-sqs-region': this.region,
                },
                annotations: {
                  ...defaultAnnotations,
                  [ANNOTATION_AWS_SQS_QUEUE_ARN]: queueArn ?? '',
                },
                queueArn,
                visibilityTimeout,
                delaySeconds,
                maximumMessageSize,
                retentionPeriod,
                approximateNumberOfMessages,
              },
              spec: {
                owner: ownerFromTags(tags, this.getOwnerTag()),
                ...relationshipsFromTags(tags),
                type: this.queueTypeValue,
              },
            };
          }

          entities.push(entity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} SQS queue resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
