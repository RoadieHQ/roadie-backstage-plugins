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
} from './userNamingStrategyFactory';
import { AccountConfig, UserFilter } from '../types';
import { userEntityFromOktaUser } from './userEntityFromOktaUser';
import { userFiltersFromConfigArray } from './filters/userFiltersFromConfigArray';
import { includeUser } from './filters/includeUser';

/**
 * Provides entities from Okta User service.
 */
export class OktaUserEntityProvider extends OktaEntityProvider {
  private readonly namingStrategy: UserNamingStrategy;
  private userFilters?: UserFilter[];

  static fromConfig(
    config: Config,
    options: { logger: winston.Logger; namingStrategy?: UserNamingStrategies },
  ) {
    const orgUrl = config.getString('orgUrl');
    const token = config.getString('token');

    const userFilters = userFiltersFromConfigArray(
      config.getOptionalConfigArray('userFilters'),
    );

    return new OktaUserEntityProvider({ orgUrl, token, userFilters }, options);
  }

  constructor(
    accountConfig: AccountConfig,
    options: { logger: winston.Logger; namingStrategy?: UserNamingStrategies },
  ) {
    super(accountConfig, options);
    this.namingStrategy = userNamingStrategyFactory(options.namingStrategy);
    this.userFilters = accountConfig.userFilters;
  }

  getProviderName(): string {
    return `okta-user-${this.orgUrl}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(`Providing okta user resources from okta: ${this.orgUrl}`);
    const userResources: UserEntity[] = [];

    const client = this.getClient();

    const defaultAnnotations = await this.buildDefaultAnnotations();

    const allUsers = await client.listUsers();

    await allUsers.each(user => {
      if (includeUser(user, this.userFilters)) {
        const userEntity = userEntityFromOktaUser(user, this.namingStrategy, {
          annotations: defaultAnnotations,
        });
        userResources.push(userEntity);
      }
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: userResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
  }
}
