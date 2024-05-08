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

import { ResourceEntity } from '@backstage/catalog-model';

import {
  OrganizationsClient,
  paginateListAccounts,
  paginateListTagsForResource,
} from '@aws-sdk/client-organizations';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ANNOTATION_ACCOUNT_ID,
  ANNOTATION_AWS_ACCOUNT_ARN,
} from '../annotations';
import { arnToName } from '../utils/arnToName';
import { labelsFromTags, ownerFromTags } from '../utils/tags';
import { Tag } from '@aws-sdk/client-organizations/dist-types/models/models_0';
import { CatalogApi } from '@backstage/catalog-client';

/**
 * Provides entities from AWS Organizations accounts.
 */
export class AWSOrganizationAccountsProvider extends AWSEntityProvider {
  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
    },
  ) {
    const accountId = config.getString('accountId');
    const roleArn = config.getString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSOrganizationAccountsProvider(
      { accountId, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-organization-accounts-${this.accountId}-${
      this.providerId ?? 0
    }`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const groups = await this.getGroups();

    this.logger.info(
      `Providing organization account resources from aws: ${this.accountId}`,
    );
    const accountResources: ResourceEntity[] = [];

    const credentials = this.getCredentials();
    const organizationsClient = new OrganizationsClient({
      credentials,
      region: this.region,
    });

    const defaultAnnotations = this.buildDefaultAnnotations();

    const paginatorConfig = {
      client: organizationsClient,
      pageSize: 20,
    };

    const accounts = paginateListAccounts(paginatorConfig, {});

    for await (const accountsPageResponse of accounts) {
      for (const account of accountsPageResponse.Accounts || []) {
        if (account) {
          const annotations: { [name: string]: string } = {
            ...(await defaultAnnotations),
          };
          const tagsResponse = paginateListTagsForResource(paginatorConfig, {
            ResourceId: account.Arn,
          });
          let tags: Tag[] = [];
          for await (const listTagsForResourceCommandOutput of tagsResponse) {
            tags = tags.concat(listTagsForResourceCommandOutput.Tags ?? []);
          }
          annotations[ANNOTATION_AWS_ACCOUNT_ARN] = account.Arn ?? '';
          annotations[ANNOTATION_ACCOUNT_ID] = account.Id ?? '';

          const resource: ResourceEntity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations,
              name: arnToName(account.Arn!),
              title: account.Name,
              joinedTimestamp: account.JoinedTimestamp?.toISOString() ?? '',
              joinedMethod: account.JoinedMethod ?? 'UNKNOWN',
              status: account.Status ?? 'UNKNOWN',
              labels: labelsFromTags(tags),
            },
            spec: {
              owner: ownerFromTags(tags, this.getOwnerTag(), groups),
              type: 'aws-account',
            },
          };

          accountResources.push(resource);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: accountResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
  }
}
