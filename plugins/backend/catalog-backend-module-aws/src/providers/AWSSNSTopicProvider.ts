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

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { SNS, paginateListTopics } from '@aws-sdk/client-sns';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_SNS_TOPIC_ARN } from '../annotations';
import { ARN } from 'link2aws';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS SNS Topics.
 */
export class AWSSNSTopicProvider extends AWSEntityProvider {
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

    return new AWSSNSTopicProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-sns-topic-${this.providerId ?? 0}`;
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
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);

    const groups = await this.getGroups();

    this.logger.info(`Providing SNS topic resources from AWS: ${accountId}`);
    const entities: Entity[] = [];

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

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
          const topicName = topic.TopicArn.split(':').pop() || 'unknown-topic';
          const consoleLink = new ARN(topic.TopicArn).consoleLink;
          let entity = this.renderEntity({ topic });
          if (!entity) {
            entity = {
              kind: 'Resource',
              apiVersion: 'backstage.io/v1alpha1',
              metadata: {
                annotations: {
                  ...(await defaultAnnotations),
                  [ANNOTATION_AWS_SNS_TOPIC_ARN]: topic.TopicArn,
                  [ANNOTATION_VIEW_URL]: consoleLink.toString(),
                },
                name: topicName,
                title: topicName,
                labels: this.labelsFromTags(tags),
              },
              spec: {
                type: 'aws-sns-topic',
                owner: ownerFromTags(tags, this.getOwnerTag(), groups),
                ...relationshipsFromTags(tags),
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
      `Finished providing ${entities.length} SNS topic resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
