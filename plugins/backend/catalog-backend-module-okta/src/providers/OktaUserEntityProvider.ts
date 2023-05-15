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
import { userEntityFromOktaUser } from './userEntityFromOktaUser';
import { getAccountConfig } from './accountConfig';
import { isError } from '@backstage/errors';

/**
 * Provides entities from Okta User service.
 */
export class OktaUserEntityProvider extends OktaEntityProvider {
  private readonly namingStrategy: UserNamingStrategy;
  private readonly userFilter?: string;
  private readonly orgUrl: string;
  private readonly customAttributesToAnnotationAllowlist: string[];

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      customAttributesToAnnotationAllowlist?: string[];
      namingStrategy?: UserNamingStrategies | UserNamingStrategy;
    },
  ) {
    const accountConfig = getAccountConfig(config);

    return new OktaUserEntityProvider(accountConfig, options);
  }

  constructor(
    accountConfig: AccountConfig,
    options: {
      logger: winston.Logger;
      customAttributesToAnnotationAllowlist?: string[];
      namingStrategy?: UserNamingStrategies | UserNamingStrategy;
    },
  ) {
    super([accountConfig], options);
    this.namingStrategy = userNamingStrategyFactory(options.namingStrategy);
    this.userFilter = accountConfig.userFilter;
    this.orgUrl = accountConfig.orgUrl;
    this.customAttributesToAnnotationAllowlist =
      options.customAttributesToAnnotationAllowlist || [];
  }

  getProviderName(): string {
    return `okta-user-${this.orgUrl}`;
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
        const userEntity = userEntityFromOktaUser(user, this.namingStrategy, {
          annotations,
        });
        userResources.push(userEntity);
      } catch (e: unknown) {
        this.logger.warn(
          `failed to add user to group: ${
            isError(e) ? e.message : 'unknown error'
          }`,
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
