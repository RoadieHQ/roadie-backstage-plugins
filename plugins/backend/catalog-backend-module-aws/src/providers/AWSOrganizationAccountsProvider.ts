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
  LoggerService,
  SchedulerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-plugin-api';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { ResourceEntity } from '@backstage/catalog-model';
import {
  OrganizationsClient,
  paginateListAccounts,
  paginateListTagsForResource,
} from '@aws-sdk/client-organizations';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
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
import { duration } from '../utils/timer';

export type AWSOrganizationAccountsProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
};

/**
 * Provides entities from AWS Organizations accounts.
 */
export class AWSOrganizationAccountsProvider extends AWSEntityProvider {
  /** [1] */
  static fromConfig(
    config: Config,
    options: AWSOrganizationAccountsProviderOptions,
  ): AWSOrganizationAccountsProvider {
    const p = new AWSOrganizationAccountsProvider(config, options);

    const defaultSchedule = {
      frequency: { minutes: 120 },
      timeout: { minutes: 60 },
      initialDelay: { seconds: 30 },
    };

    const schedule = config.has('schedule')
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('schedule'),
        )
      : defaultSchedule;

    options.scheduler.scheduleTask({
      frequency: schedule.frequency,
      timeout: schedule.timeout,
      initialDelay: schedule.initialDelay,
      id: 'aws-organization-accounts-entity-provider',
      fn: p.run,
    });

    return p;
  }

  /** [2] */
  getProviderName(): string {
    return `aws-organization-accounts-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { seconds: 5 },
      timeout: { seconds: 30 },
      id: 'aws-organization-accounts-entity-provider',
      fn: this.run,
    });
    await this.run();
  }

  private async getOrganizationsClient() {
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';
    const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(
      this.config,
    );
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    return new OrganizationsClient({
      region,
      credentialDefaultProvider: () =>
        awsCredentialProvider.sdkCredentialProvider,
    });
  }

  /** [4] */
  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';

    const startTimestamp = process.hrtime();
    const groups = await this.getGroups();

    this.logger.info(
      `Providing Organization account resources from AWS: ${accountId}`,
    );
    const accountResources: ResourceEntity[] = [];

    const organizationsClient = await this.getOrganizationsClient();

    const defaultAnnotations = this.buildDefaultAnnotations(
      this.config,
      accountId,
      region,
    );

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
              labels: this.labelsFromTags(tags),
            },
            spec: {
              owner: ownerFromTags(tags, this.getOwnerTag(), groups),
              ...relationshipsFromTags(tags),
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

    this.logger.info(
      `Finished providing ${accountResources.length} Organization account resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
