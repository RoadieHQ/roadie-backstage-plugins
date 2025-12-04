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
import { STS } from '@aws-sdk/client-sts';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import type {
  AwsCredentialIdentityProvider,
  RuntimeConfigAwsCredentialIdentityProvider,
} from '@aws-sdk/types';
import { parse as parseArn } from '@aws-sdk/util-arn-parser';
import {
  AuthService,
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
} from '@backstage/catalog-model';
import { Config, ConfigReader } from '@backstage/config';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import {
  CatalogService,
  DeferredEntity,
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { Environment } from 'nunjucks';
import type { Logger } from 'winston';

import { ANNOTATION_ACCOUNT_ID } from '../annotations';
import {
  AccountConfig,
  AWSEntityProviderConfig,
  DynamicAccountConfig,
} from '../types';
import { labelsFromTags, LabelValueMapper, Tag } from '../utils/tags';
import { CloudResourceTemplate } from '../utils/templating';

export abstract class AWSEntityProvider<CloudResource>
  implements EntityProvider
{
  private readonly account: AccountConfig;
  protected readonly authService?: AuthService;
  private readonly credentialsManager: DefaultAwsCredentialsManager;
  protected connection?: EntityProviderConnection;
  protected readonly catalogService?: CatalogService;
  protected readonly labelValueMapper: LabelValueMapper | undefined;
  protected readonly logger: Logger | LoggerService;
  private readonly ownerTag: string | undefined;
  protected readonly providerId?: string;
  protected readonly taskRunner?: SchedulerServiceTaskRunner;
  protected readonly template: CloudResourceTemplate;
  protected readonly useTemporaryCredentials: boolean;

  public abstract getProviderName(): string;
  public abstract run(
    dynamicAccountConfig?: DynamicAccountConfig,
  ): Promise<void>;
  /**
   * Get the default template string to use for this provider.
   *
   * Overriding this method changes the default, but it still allows for passing in a template for any individual
   * instance.
   */
  protected abstract getDefaultTemplate(): string;
  /**
   * Get the annotations to apply to the resource entity.
   *
   * Annotations are often significantly more complex than are easy to work with in the templates, so this method allows
   * subclasses to define them programmatically.
   */
  protected abstract getResourceAnnotations(
    resource: CloudResource,
    context: { accountId: string; region: string },
  ): Record<string, string>;
  /**
   * Add your own Nunjucks filters for use in the templates.
   *
   * Now that you are adding your own template, you may want to add custom filters to help with complex functionality
   * that is awkward to do in the templates alone. Additionally, you can overwrite existing filters if you need to
   * change their by using `env.getFilter` (if you want the original method too) and `env.addFilter` (with the same
   * name) to replace it.
   */
  protected addCustomFilters?(env: Environment): void;

  protected constructor(
    account: AccountConfig,
    options: AWSEntityProviderConfig,
  ) {
    this.authService = options.authService;
    this.logger = options.logger;
    this.providerId = options.providerId;
    this.ownerTag = options.ownerTag;
    this.catalogService = options.catalogService;
    this.account = account;
    this.useTemporaryCredentials = !!options.useTemporaryCredentials;
    this.taskRunner = options.taskRunner;
    this.credentialsManager = DefaultAwsCredentialsManager.fromConfig(
      new ConfigReader({ aws: { accounts: [account] } }),
    );
    this.labelValueMapper = options.labelValueMapper;

    this.template = CloudResourceTemplate.fromConfig({
      templateString: options.template ?? this.getDefaultTemplate(),
      accountId: this.account.accountId,
      region: this.account.region,
      ownerTagKey: this.ownerTag,
      labelValueMapper: this.labelValueMapper,
      getResourceAnnotations: this.getResourceAnnotations.bind(this),
      addCustomFilters: this.addCustomFilters?.bind(this),
    });
  }

  static fromConfig(config: Config, options: AWSEntityProviderConfig) {
    const accountId = config.getString('accountId');
    const roleName = config.getString('roleName');
    const roleArn = config.getOptionalString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    /**
     * Typescript complains on `new this()` in abstract classes, but it works at runtime, when `this` is the concrete
     * subclass. Using this, it allows us to have a common `fromConfig` method on all subclasses without each needing to
     * implement it (it was identical in virtually all of them).
     */
    // @ts-expect-error
    return new this(
      { accountId, roleName, roleArn, externalId, region },
      options,
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

  /**
   * Convert AWS tags to Backstage labels.
   *
   * If you override this method, be sure to do something to ensure that the values are valid `label` values.
   * @see ../../src/utils/sanitizeName.ts
   */
  protected labelsFromTags(tags?: Record<string, string> | Tag[] | undefined) {
    return labelsFromTags(tags, this.labelValueMapper);
  }

  protected getCredentials(
    dynamicAccountConfig?: DynamicAccountConfig,
  ): RuntimeConfigAwsCredentialIdentityProvider {
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

  /**
   * Generates a parsed config object for the current account, optionally overridden by a dynamic account config.
   */
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

  protected async getCredentialsProvider(): Promise<AwsCredentialIdentityProvider> {
    const awsCredentialProvider =
      await this.credentialsManager.getCredentialProvider({
        accountId: this.accountId,
      });
    return awsCredentialProvider.sdkCredentialProvider;
  }

  /**
   * This should be called for each batch of entities to ensure it's up to date, rather than being called once and
   * cached.
   *
   * FUTURE: If this is going be used super consistently across all providers, we could potentially move the call to it
   * into CloudResourceTemplate. This could reduce the complexity of the `run` methods in each provider.
   */
  protected async getGroups(): Promise<Entity[] | undefined> {
    let groups = undefined;
    if (this.catalogService && this.authService) {
      try {
        const response = await this.catalogService.getEntities(
          {
            filter: { kind: 'Group' },
            fields: ['metadata.name', 'metadata.namespace', 'kind'],
          },
          {
            credentials: await this.authService.getOwnServiceCredentials(),
          },
        );
        groups = response?.items;
      } catch (e: any) {
        this.logger.error(`Failed to fetch groups due to error: ${e.message}`);
      }
    }
    return groups;
  }

  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    if (this.taskRunner?.run) {
      await this.taskRunner.run({
        id: this.getProviderName(),
        fn: async (dynamicAccountConfig?: DynamicAccountConfig) => {
          await this.run(dynamicAccountConfig);
        },
      });
    }
  }

  /**
   * Almost every resource has these same default annotations, but they are different by batch when working with dynamic
   * credentials.
   *
   * FUTURE: If this is going be used super consistently across all providers, we could potentially move the call to it
   * into CloudResourceTemplate and require `dynamicAccountConfig` to be passed into `template.child()`. This could
   * reduce the complexity of the `run` methods in each provider.
   */
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

  /**
   * Let's add your new entities to the catalog!
   */
  protected async applyMutation(entities: Entity[] | Promise<Entity>[]) {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    return this.connection.applyMutation({
      type: 'full',
      entities: (await Promise.all(entities as Promise<Entity>[])).map(
        entity => ({
          entity,
          locationKey: this.getProviderName(),
        }),
      ),
    });
  }
}
