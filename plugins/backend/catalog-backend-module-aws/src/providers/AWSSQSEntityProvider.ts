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
import {
  GetQueueAttributesCommandOutput,
  paginateListQueues,
  SQS,
} from '@aws-sdk/client-sqs';
import { Entity } from '@backstage/catalog-model';

import { ANNOTATION_AWS_SQS_QUEUE_ARN } from '../annotations';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

import { AWSEntityProvider } from './AWSEntityProvider';
import defaultTemplate from './AWSSQSEntityProvider.default.yaml.njk';

type QueueAttributes = GetQueueAttributesCommandOutput['Attributes'];

/**
 * Provides entities from AWS SQS service.
 */
export class AWSSQSEntityProvider extends AWSEntityProvider<QueueAttributes> {
  getProviderName(): string {
    return `aws-sqs-queue-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: Record<string, string>,
  ): Record<string, string> {
    const queueArn = resource.QueueArn;
    return {
      [ANNOTATION_AWS_SQS_QUEUE_ARN]: queueArn,
    };
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
    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(`Providing SQS queue resources from AWS: ${accountId}`);
    const sqsResources: Array<Promise<Entity>> = [];

    const sqs = await this.getSQSClient(dynamicAccountConfig);

    // Create child template
    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

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

          sqsResources.push(
            template.render({
              data: attributes.Attributes || {},
              tags,
            }),
          );
        }
      }
    }

    await this.applyMutation(sqsResources);

    this.logger.info(
      `Finished providing ${sqsResources.length} SQS queue resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
