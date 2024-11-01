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

import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
import { STS } from '@aws-sdk/client-sts';
import {
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_LOCATION,
} from '@backstage/catalog-model';
import { ANNOTATION_ACCOUNT_ID } from '../annotations';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { LabelValueMapper, labelsFromTags, Tag } from '../utils/tags';

export abstract class AWSEntityProvider implements EntityProvider {
  protected readonly config: Config;
  protected readonly logger: LoggerService;
  protected readonly scheduler: SchedulerService;
  protected readonly providerId?: string;

  protected connection?: EntityProviderConnection;
  private readonly ownerTag: string | undefined;
  protected readonly catalogApi?: CatalogApi;
  protected readonly labelValueMapper: LabelValueMapper | undefined;

  public abstract getProviderName(): string;
  public abstract run(
    config: Config,
    accountId: string,
    region: string,
  ): Promise<void>;

  protected constructor(
    config: Config,
    options: {
      logger: LoggerService;
      scheduler: SchedulerService;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      labelValueMapper?: LabelValueMapper;
    },
  ) {
    this.config = config;
    this.logger = options.logger;
    this.scheduler = options.scheduler;
    this.providerId = options.providerId;
    this.ownerTag = options.ownerTag;
    this.catalogApi = options.catalogApi;
    this.labelValueMapper = options.labelValueMapper;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
  }

  get accountId() {
    return this.config.getOptionalString('accountId');
  }

  get region() {
    return this.config.getOptionalString('region') ?? 'us-east-1';
  }

  protected getOwnerTag() {
    return this.ownerTag ?? 'owner';
  }

  protected labelsFromTags(tags?: Record<string, string> | Tag[] | undefined) {
    return labelsFromTags(tags, this.labelValueMapper);
  }

  protected async getGroups() {
    let groups = undefined;
    if (this.catalogApi) {
      try {
        const response = await this.catalogApi.getEntities({
          filter: { kind: 'Group' },
          fields: ['metadata.name', 'metadata.namespace', 'kind'],
        });
        groups = response?.items;
      } catch (e: any) {
        this.logger.error(`Failed to fetch groups due to error: ${e.message}`);
      }
    }
    return groups;
  }

  protected async buildDefaultAnnotations(
    config: Config,
    accountId: string,
    region: string,
  ) {
    const awsCredentialsManager =
      DefaultAwsCredentialsManager.fromConfig(config);
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    const sts = new STS({
      region,
      credentialDefaultProvider: () =>
        awsCredentialProvider.sdkCredentialProvider,
    });

    const account = await sts.getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: account.Arn as string,
      [ANNOTATION_ORIGIN_LOCATION]: account.Arn as string,
    };

    if (account.Account) {
      defaultAnnotations[ANNOTATION_ACCOUNT_ID] = account.Account;
    }

    return defaultAnnotations;
  }
}
