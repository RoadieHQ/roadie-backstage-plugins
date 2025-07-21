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
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
import { AccountConfig, DynamicAccountConfig } from '../types';
import { STS } from '@aws-sdk/client-sts';
import {
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_LOCATION,
  Entity,
} from '@backstage/catalog-model';
import { ANNOTATION_ACCOUNT_ID } from '../annotations';
import { CatalogApi } from '@backstage/catalog-client';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { ConfigReader } from '@backstage/config';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { parse as parseArn } from '@aws-sdk/util-arn-parser';
import { LabelValueMapper, labelsFromTags, Tag } from '../utils/tags';
import { compile, Environment, Template } from 'nunjucks';
import crypto from 'crypto';
import yaml from 'js-yaml';

export abstract class AWSEntityProvider implements EntityProvider {
  protected readonly useTemporaryCredentials: boolean;
  protected readonly providerId?: string;
  protected readonly logger: Logger | LoggerService;
  protected connection?: EntityProviderConnection;
  private readonly ownerTag: string | undefined;
  protected readonly catalogApi?: CatalogApi;
  private credentialsManager: DefaultAwsCredentialsManager;
  private account: AccountConfig;
  protected readonly labelValueMapper: LabelValueMapper | undefined;
  private template: Template | undefined;

  public abstract getProviderName(): string;
  public abstract run(
    dynamicAccountConfig?: DynamicAccountConfig,
  ): Promise<void>;

  protected constructor(
    account: AccountConfig,
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
    this.logger = options.logger;
    this.providerId = options.providerId;
    this.ownerTag = options.ownerTag;
    this.catalogApi = options.catalogApi;
    this.account = account;
    this.useTemporaryCredentials = !!options.useTemporaryCredentials;
    this.credentialsManager = DefaultAwsCredentialsManager.fromConfig(
      new ConfigReader({ aws: { accounts: [account] } }),
    );
    this.labelValueMapper = options.labelValueMapper;
    if (options.template) {
      const env = new Environment();
      env.addFilter('to_entity_name', input => {
        return crypto
          .createHash('sha256')
          .update(input)
          .digest('hex')
          .slice(0, 63);
      });
      env.addFilter('split', function(str, delimiter) {
        return str.split(delimiter);
      });
      this.template = compile(options.template, env);
    }
  }

  protected renderEntity(context: any, options?: { defaultAnnotations: Record<string, string>}): Entity | undefined {
    if (this.template) {
      const entity = yaml.load(
        this.template.render({
          ...context,
          accountId: this.accountId,
          region: this.region,
        }),
      ) as Entity;
      entity.metadata.annotations = {
        ...options?.defaultAnnotations || {},
        ...entity.metadata.annotations,
      }
      return entity;
    }
    return undefined;
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

  protected labelsFromTags(tags?: Record<string, string> | Tag[] | undefined) {
    return labelsFromTags(tags, this.labelValueMapper);
  }

  protected getCredentials(dynamicAccountConfig?: DynamicAccountConfig) {
    const { roleArn, externalId, region } =
      this.getParsedConfig(dynamicAccountConfig);
    return fromTemporaryCredentials({
      params: {
        RoleArn: roleArn,
        ExternalId: externalId,
      },
      clientConfig: region ? { region: region } : undefined,
    });
  }

  protected getParsedConfig(dynamicAccountConfig?: DynamicAccountConfig) {
    const { roleArn, externalId, region } = dynamicAccountConfig
      ? dynamicAccountConfig
      : { roleArn: undefined, externalId: undefined, region: undefined };

    const arn = roleArn ?? this.account.roleArn ?? this.account.roleName;
    const arnParse = parseArn(arn);
    return {
      accountId: arnParse?.accountId,
      region: region ?? this.region ?? arnParse.region,
      externalId: externalId ?? this.account.externalId,
      roleArn: arn,
    };
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

  protected async buildDefaultAnnotations(
    dynamicAccountConfig?: DynamicAccountConfig,
  ) {
    const { region, roleArn } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    const sts = this.useTemporaryCredentials
      ? new STS({ credentials: credentials, region: region })
      : new STS(credentials);

    const account = await sts.getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: `${this.getProviderName()}:${roleArn}`,
      [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${roleArn}`,
    };

    if (account.Account) {
      defaultAnnotations[ANNOTATION_ACCOUNT_ID] = account.Account;
    }

    return defaultAnnotations;
  }
}
