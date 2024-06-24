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
import * as winston from 'winston';
import { AccountConfig } from '../types';
import { STS } from '@aws-sdk/client-sts';
import {
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_LOCATION,
} from '@backstage/catalog-model';
import { ANNOTATION_ACCOUNT_ID } from '../annotations';
import { CatalogApi } from '@backstage/catalog-client';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { ConfigReader } from '@backstage/config';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { parse as parseArn } from '@aws-sdk/util-arn-parser';

export abstract class AWSEntityProvider implements EntityProvider {
  protected readonly useTemporaryCredentials: boolean;
  protected readonly providerId?: string;
  protected readonly logger: winston.Logger;
  protected connection?: EntityProviderConnection;
  private readonly ownerTag: string | undefined;
  protected readonly catalogApi?: CatalogApi;
  private credentialsManager: DefaultAwsCredentialsManager;
  private account: AccountConfig;

  public abstract getProviderName(): string;

  protected constructor(
    account: AccountConfig,
    options: {
      logger: winston.Logger;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
    },
  ) {
    this.logger = options.logger;
    this.providerId = options.providerId;
    this.ownerTag = options.ownerTag;
    this.catalogApi = options.catalogApi;
    this.account = account;
    this.useTemporaryCredentials = !!options.useTemporaryCredentials;
    this.credentialsManager = DefaultAwsCredentialsManager.fromConfig(
      new ConfigReader({ aws: { accounts: [account] } }),
    );
  }

  get accountId() {
    return this.account.accountId;
  }
  get region() {
    return this.account.region;
  }

  protected getOwnerTag() {
    return this.ownerTag ?? 'owner';
  }

  protected getCredentials() {
    const region = parseArn(
      this.account.roleArn ?? this.account.roleName,
    ).region;
    return fromTemporaryCredentials({
      params: {
        RoleArn: this.account.roleArn,
        ExternalId: this.account.externalId,
      },
      clientConfig: { region: region },
    });
  }

  protected async getCredentialsProvider() {
    const awsCredentialProvider =
      await this.credentialsManager.getCredentialProvider({
        accountId: this.accountId,
      });
    return awsCredentialProvider.sdkCredentialProvider;
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

  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  protected async buildDefaultAnnotations() {
    const sts = new STS(await this.getCredentialsProvider());

    const account = await sts.getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: `${this.getProviderName()}:${
        this.account.roleName
      }`,
      [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${
        this.account.roleName
      }`,
    };

    if (account.Account) {
      defaultAnnotations[ANNOTATION_ACCOUNT_ID] = account.Account;
    }

    return defaultAnnotations;
  }
}
