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

import { readFileSync } from 'fs';

import { Entity } from '@backstage/catalog-model';
import {
  DomainStatus,
  ListTagsCommandOutput,
  OpenSearch,
} from '@aws-sdk/client-opensearch';
import { AWSEntityProvider } from './AWSEntityProvider';
import { Tag } from '../utils/tags';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';
import { ANNOTATION_AWS_OPEN_SEARCH_ARN } from '../annotations';
import { Environment } from 'nunjucks';

const defaultTemplate = readFileSync(
  require.resolve('./AWSOpenSearchEntityProvider.default.yaml.njk'),
  'utf-8',
);

/**
 * Provides entities from AWS OpenSearch service.
 */
export class AWSOpenSearchEntityProvider extends AWSEntityProvider<DomainStatus> {
  protected addCustomFilters(env: Environment): void {
    env.addFilter('get_storage_type', (data: DomainStatus) => {
      if (data.EBSOptions && data.EBSOptions.EBSEnabled) {
        return `EBS-${data.EBSOptions.VolumeType}`;
      }
      return 'Instance Storage';
    });
  }
  getProviderName(): string {
    return `aws-opensearch-domain-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: DomainStatus,
  ): Record<string, string> {
    return {
      [ANNOTATION_AWS_OPEN_SEARCH_ARN]: resource.ARN ?? '',
    };
  }

  private async getOpenSearchClient(
    dynamicAccountConfig?: DynamicAccountConfig,
  ) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new OpenSearch({ credentials, region })
      : new OpenSearch(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const startTimestamp = process.hrtime();
    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(
      `Providing OpenSearch domain resources from AWS: ${accountId}`,
    );
    const opensearchResources: Array<Promise<Entity>> = [];

    const openSearchClient = await this.getOpenSearchClient(
      dynamicAccountConfig,
    );

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const domainList = await openSearchClient.listDomainNames();

    if (domainList.DomainNames) {
      for (const {
        DomainName: domainName = 'unknown',
      } of domainList.DomainNames) {
        const domain = await openSearchClient.describeDomain({
          DomainName: domainName,
        });
        const domainStatus = domain.DomainStatus;
        const domainArn = domainStatus?.ARN;
        const tagsResponse = domainArn
          ? await openSearchClient.listTags({ ARN: domainArn })
          : ({ TagList: [] as Tag[] } as ListTagsCommandOutput);
        const tags = tagsResponse.TagList ?? [];

        opensearchResources.push(
          template.render({
            data: domainStatus,
            tags,
          }),
        );
      }
    }

    const entities = await Promise.all(opensearchResources);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} OpenSearch domain resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
