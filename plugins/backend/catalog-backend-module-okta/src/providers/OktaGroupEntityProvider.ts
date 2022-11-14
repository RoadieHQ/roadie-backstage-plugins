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

import { GroupEntity } from '@backstage/catalog-model';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { OktaEntityProvider } from './OktaEntityProvider';
import {
  GroupNamingStrategies,
  GroupNamingStrategy,
  groupNamingStrategyFactory,
} from './groupNamingStrategyFactory';
import {
  UserNamingStrategies,
  UserNamingStrategy,
  userNamingStrategyFactory,
} from './userNamingStrategyFactory';
import { userFiltersFromConfigArray } from './filters/userFiltersFromConfigArray';
import { AccountConfig, GroupFilter, UserFilter } from '../types';
import { groupEntityFromOktaGroup } from './groupEntityFromOktaGroup';
import { includeUser } from './filters/includeUser';
import { includeGroup } from './filters/includeGroup';

/**
 * Provides entities from Okta Group service.
 */
export class OktaGroupEntityProvider extends OktaEntityProvider {
  private readonly namingStrategy: GroupNamingStrategy;
  private readonly userNamingStrategy: UserNamingStrategy;
  private userFilters: UserFilter[] | undefined;
  private groupFilters: GroupFilter[] | undefined;
  private orgUrl: string;

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      namingStrategy?: GroupNamingStrategies;
      userNamingStrategy?: UserNamingStrategies;
    },
  ) {
    const orgUrl = config.getString('orgUrl');
    const token = config.getString('token');

    const userFilters = userFiltersFromConfigArray(
      config.getOptionalConfigArray('userFilters'),
    );
    const groupFilters = userFiltersFromConfigArray(
      config.getOptionalConfigArray('groupFilters'),
    );

    return new OktaGroupEntityProvider(
      { orgUrl, token, userFilters, groupFilters },
      options,
    );
  }

  constructor(
    accountConfig: AccountConfig,
    options: {
      logger: winston.Logger;
      namingStrategy?: GroupNamingStrategies;
      userNamingStrategy?: UserNamingStrategies;
    },
  ) {
    super([accountConfig], options);
    this.namingStrategy = groupNamingStrategyFactory(options.namingStrategy);
    this.userNamingStrategy = userNamingStrategyFactory(
      options.userNamingStrategy,
    );
    this.orgUrl = accountConfig.orgUrl;
    this.userFilters = accountConfig.userFilters;
    this.groupFilters = accountConfig.groupFilters;
  }

  getProviderName(): string {
    return `okta-group-${this.orgUrl}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      `Providing okta group resources from okta: ${this.orgUrl}`,
    );
    const groupResources: GroupEntity[] = [];

    const client = this.getClient(this.orgUrl);

    const defaultAnnotations = await this.buildDefaultAnnotations();

    await client.listGroups().each(async group => {
      if (includeGroup(group, this.groupFilters)) {
        const members: string[] = [];
        await group.listUsers().each(user => {
          if (includeUser(user, this.userFilters)) {
            members.push(this.userNamingStrategy(user));
          }
        });

        const groupEntity = groupEntityFromOktaGroup(
          group,
          this.namingStrategy,
          { annotations: defaultAnnotations, members },
        );

        groupResources.push(groupEntity);
      }
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: groupResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
  }
}
