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

import {
  OrganizationsClient,
  paginateListAccounts,
  paginateListTagsForResource,
} from '@aws-sdk/client-organizations';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ANNOTATION_ACCOUNT_ID,
  ANNOTATION_AWS_ACCOUNT_ARN,
} from '../annotations';
import { arnToName } from '../utils/arnToName';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { Tag } from '@aws-sdk/client-organizations/dist-types/models/models_0';
import { CatalogApi } from '@backstage/catalog-client';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS Organizations accounts.
 */
export class AWSOrganizationAccountsProvider extends AWSEntityProvider {
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

    return new AWSOrganizationAccountsProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-organization-accounts-${this.providerId ?? 0}`;
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
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);

    const groups = await this.getGroups();

    this.logger.info(
      `Providing Organization account resources from AWS: ${accountId}`,
    );
    const accountEntities: Entity[] = [];

    const organizationsClient = await this.getOrganizationsClient(
      dynamicAccountConfig,
    );

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

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
            ResourceId: account.Id,
          });
          let tags: Tag[] = [];
          for await (const listTagsForResourceCommandOutput of tagsResponse) {
            tags = tags.concat(listTagsForResourceCommandOutput.Tags ?? []);
          }
          annotations[ANNOTATION_AWS_ACCOUNT_ARN] = account.Arn ?? '';
          annotations[ANNOTATION_ACCOUNT_ID] = account.Id ?? '';

          let entity = this.renderEntity(
            { account, tags },
            { defaultAnnotations: annotations },
          );
          if (!entity) {
            entity = {
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              metadata: {
                annotations,
                name: arnToName(account.Arn!),
                title: account.Name,
                joinedTimestamp: account.JoinedTimestamp?.toISOString() ?? '',
                joinedMethod: account.JoinedMethod ?? 'UNKNOWN',
                status: account.Status ?? 'UNKNOWN',
                labels: this.labelsFromTags(tags),
              },
              spec: {
                owner: ownerFromTags(tags, this.getOwnerTag(), groups),
                ...relationshipsFromTags(tags),
                type: 'aws-account',
              },
            };
          }

          accountEntities.push(entity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: accountEntities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${accountEntities.length} Organization account resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
