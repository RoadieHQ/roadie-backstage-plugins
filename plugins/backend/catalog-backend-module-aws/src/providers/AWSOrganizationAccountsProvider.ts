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
  Account,
  OrganizationsClient,
  paginateListAccounts,
  paginateListTagsForResource,
  Tag,
} from '@aws-sdk/client-organizations';
import { Entity } from '@backstage/catalog-model';

import {
  ANNOTATION_ACCOUNT_ID,
  ANNOTATION_AWS_ACCOUNT_ARN,
} from '../annotations';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

import { AWSEntityProvider } from './AWSEntityProvider';
import defaultTemplate from './AWSOrganizationAccountsProvider.default.yaml.njk';

/**
 * Provides entities from AWS Organizations accounts.
 */
export class AWSOrganizationAccountsProvider extends AWSEntityProvider<Account> {
  getProviderName(): string {
    return `aws-organization-accounts-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(resource: Account): Record<string, string> {
    return {
      [ANNOTATION_AWS_ACCOUNT_ARN]: resource.Arn ?? '',
      [ANNOTATION_ACCOUNT_ID]: resource.Id ?? '',
    };
  }

  private async getOrganizationsClient(
    dynamicAccountConfig?: DynamicAccountConfig,
  ) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new OrganizationsClient({
          credentials,
          region,
        })
      : new OrganizationsClient(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();
    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(
      `Providing Organization account resources from AWS: ${accountId}`,
    );
    const accountResources: Array<Promise<Entity>> = [];

    const organizationsClient = await this.getOrganizationsClient(
      dynamicAccountConfig,
    );

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const paginatorConfig = {
      client: organizationsClient,
      pageSize: 20,
    };

    const accounts = paginateListAccounts(paginatorConfig, {});

    for await (const accountsPageResponse of accounts) {
      for (const account of accountsPageResponse.Accounts || []) {
        if (account) {
          const tagsResponse = paginateListTagsForResource(paginatorConfig, {
            ResourceId: account.Id,
          });
          let tags: Tag[] = [];
          for await (const listTagsForResourceCommandOutput of tagsResponse) {
            tags = tags.concat(listTagsForResourceCommandOutput.Tags ?? []);
          }

          accountResources.push(
            template.render({
              data: account,
              tags,
            }),
          );
        }
      }
    }

    await this.applyMutation(accountResources);

    this.logger.info(
      `Finished providing ${accountResources.length} Organization account resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
