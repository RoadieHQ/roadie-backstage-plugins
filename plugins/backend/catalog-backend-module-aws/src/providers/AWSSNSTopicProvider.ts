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

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { SNS, Topic, paginateListTopics } from '@aws-sdk/client-sns';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_SNS_TOPIC_ARN } from '../annotations';
import { ARN } from 'link2aws';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

const defaultTemplate = readFileSync(
  require.resolve('./AWSSNSTopicProvider.default.yaml.njk'),
  'utf-8',
);

/**
 * Provides entities from AWS SNS Topics.
 */
export class AWSSNSTopicProvider extends AWSEntityProvider<Topic> {
  getProviderName(): string {
    return `aws-sns-topic-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(resource: {
    TopicArn: string;
  }): Record<string, string> {
    const consoleLink = new ARN(resource.TopicArn).consoleLink;
    return {
      [ANNOTATION_AWS_SNS_TOPIC_ARN]: resource.TopicArn,
      [ANNOTATION_VIEW_URL]: consoleLink.toString(),
    };
  }

  private async getSnsClient(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return new SNS({ credentials, region });
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();
    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(`Providing SNS topic resources from AWS: ${accountId}`);
    const snsResources: Array<Promise<Entity>> = [];

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const sns = await this.getSnsClient(dynamicAccountConfig);

    const paginatorConfig = {
      client: sns,
      pageSize: 25,
    };

    const topicPages = paginateListTopics(paginatorConfig, {});

    for await (const topicPage of topicPages) {
      for (const topic of topicPage.Topics || []) {
        if (topic.TopicArn) {
          const tagsResponse = await sns.listTagsForResource({
            ResourceArn: topic.TopicArn,
          });
          const tags = tagsResponse.Tags ?? [];

          snsResources.push(
            template.render({
              data: topic,
              tags,
            }),
          );
        }
      }
    }

    const entities = await Promise.all(snsResources);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} SNS topic resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
