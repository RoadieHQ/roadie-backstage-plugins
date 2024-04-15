/*
 * Copyright 2022 Larder Software Limited
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

import { UserEntity } from '@backstage/catalog-model';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { OktaEntityProvider } from './OktaEntityProvider';
import {
  UserNamingStrategies,
  UserNamingStrategy,
  userNamingStrategyFactory,
} from './userNamingStrategies';
import { AccountConfig } from '../types';
import { userEntityFromOktaUser as defaultUserEntityFromOktaUser } from './userEntityFromOktaUser';
import { DEFAULT_PROVIDER_ID, getAccountConfig } from './accountConfig';
import { isError } from '@backstage/errors';
import { OktaUserEntityTransformer } from './types';
import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import * as uuid from 'uuid';

/**
 * Provides entities from Okta User service.
 */
export class OktaUserEntityProvider extends OktaEntityProvider {
  private readonly namingStrategy: UserNamingStrategy;
  private readonly userEntityFromOktaUser: OktaUserEntityTransformer;
  private readonly userFilter?: string;
  private readonly orgUrl: string;
  private readonly customAttributesToAnnotationAllowlist: string[];
  private readonly taskRunner: TaskRunner;

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      customAttributesToAnnotationAllowlist?: string[];
      namingStrategy?: UserNamingStrategies | UserNamingStrategy;
      userTransformer?: OktaUserEntityTransformer;
      schedule?: TaskRunner;
      scheduler?: PluginTaskScheduler;
    },
  ) {
    if (!options.schedule && !options.scheduler) {
      throw new Error('Either schedule or scheduler must be provided.');
    }

    const accountConfig = getAccountConfig(config, DEFAULT_PROVIDER_ID);

    const taskRunner =
      options.schedule ??
      options.scheduler!.createScheduledTaskRunner(accountConfig.schedule!);

    return new OktaUserEntityProvider(accountConfig, {
      ...options,
      taskRunner,
    });
  }

  constructor(
    accountConfig: AccountConfig,
    options: {
      logger: winston.Logger;
      customAttributesToAnnotationAllowlist?: string[];
      namingStrategy?: UserNamingStrategies | UserNamingStrategy;
      userTransformer?: OktaUserEntityTransformer;
      taskRunner: TaskRunner;
    },
  ) {
    super(accountConfig, options);
    this.namingStrategy = userNamingStrategyFactory(options.namingStrategy);
    this.userEntityFromOktaUser =
      options.userTransformer || defaultUserEntityFromOktaUser;
    this.userFilter = accountConfig.userFilter;
    this.orgUrl = accountConfig.orgUrl;
    this.customAttributesToAnnotationAllowlist =
      options.customAttributesToAnnotationAllowlist || [];
    this.taskRunner = options.taskRunner;
  }

  getProviderName(): string {
    return `provider-okta-user:${this.account.id}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.taskRunner.run({
      id: `${this.getProviderName()}:refresh`,
      fn: async () => {
        const logger = this.logger.child({
          class: OktaUserEntityProvider.prototype.constructor.name,
          taskId: `${this.getProviderName()}:refresh`,
          taskInstanceId: uuid.v4(),
        });

        try {
          await this.run();
        } catch (error) {
          logger.error(
            `${this.getProviderName()} refresh failed, ${error}`,
            error,
          );
        }
      },
    });
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(`Providing user resources from okta: ${this.orgUrl}`);
    const userResources: UserEntity[] = [];

    const client = this.getClient(this.orgUrl, ['okta.users.read']);

    const defaultAnnotations = await this.buildDefaultAnnotations();

    const allUsers = await client.listUsers({ search: this.userFilter });

    await allUsers.each(user => {
      const profileAnnotations = this.getCustomAnnotations(
        user,
        this.customAttributesToAnnotationAllowlist,
      );

      const annotations = {
        ...defaultAnnotations,
        ...profileAnnotations,
      };
      try {
        const userEntity = this.userEntityFromOktaUser(
          user,
          this.namingStrategy,
          { annotations },
        );
        userResources.push(userEntity);
      } catch (e: unknown) {
        this.logger.warn(
          `Failed to add user: ${isError(e) ? e.message : 'unknown error'}`,
        );
      }
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: userResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
    this.logger.info(
      `Finished providing ${userResources.length} user resources from okta: ${this.orgUrl}`,
    );
  }
}
