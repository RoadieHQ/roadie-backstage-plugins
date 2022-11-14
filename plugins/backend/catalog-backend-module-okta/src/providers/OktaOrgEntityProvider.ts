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

import { GroupEntity, UserEntity } from '@backstage/catalog-model';
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
import { userEntityFromOktaUser } from './userEntityFromOktaUser';
import { includeGroup } from './filters/includeGroup';
import { includeUser } from './filters/includeUser';
import { userFiltersFromConfigArray } from './filters/userFiltersFromConfigArray';
import { AccountConfig, GroupFilter, UserFilter } from '../types';

/**
 * Provides entities from Okta Org service.
 */
export class OktaOrgEntityProvider extends OktaEntityProvider {
  private readonly namingStrategy: GroupNamingStrategy;
  private readonly userNamingStrategy: UserNamingStrategy;
  private userFilters: UserFilter[] | undefined;
  private groupFilters: GroupFilter[] | undefined;

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

    return new OktaOrgEntityProvider(
      { orgUrl, token, groupFilters, userFilters },
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
    super(accountConfig, options);
    this.namingStrategy = groupNamingStrategyFactory(options.namingStrategy);
    this.userNamingStrategy = userNamingStrategyFactory(
      options.userNamingStrategy,
    );

    this.userFilters = accountConfig.userFilters;
    this.groupFilters = accountConfig.groupFilters;
  }

  getProviderName(): string {
    return `okta-org-${this.orgUrl}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      `Providing okta user and group resources from okta: ${this.orgUrl}`,
    );
    const resources: (GroupEntity | UserEntity)[] = [];

    const client = this.getClient();

    const defaultAnnotations = await this.buildDefaultAnnotations();

    await client.listGroups().each(async group => {
      if (includeGroup(group, this.groupFilters)) {
        const members: string[] = [];
        await group.listUsers().each(user => {
          if (includeUser(user, this.userFilters)) {
            resources.push(
              userEntityFromOktaUser(user, this.userNamingStrategy, {
                annotations: defaultAnnotations,
              }),
            );
            members.push(this.userNamingStrategy(user));
          }
        });

        const groupEntity: GroupEntity = {
          kind: 'Group',
          apiVersion: 'backstage.io/v1alpha1',
          metadata: {
            annotations: {
              ...defaultAnnotations,
            },
            name: this.namingStrategy(group),
            title: group.profile.name,
            description: group.profile.description || '',
          },
          spec: {
            members,
            type: 'group',
            children: [],
          },
        };

        if (members.length > 0) {
          resources.push(groupEntity);
        }
      }
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: resources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
  }
}
