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
import { AccountConfig } from '../types';
import { groupEntityFromOktaGroup } from './groupEntityFromOktaGroup';

/**
 * Provides entities from Okta Org service.
 */
export class OktaOrgEntityProvider extends OktaEntityProvider {
  private readonly groupNamingStrategy: GroupNamingStrategy;
  private readonly userNamingStrategy: UserNamingStrategy;

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      groupNamingStrategy?: GroupNamingStrategies;
      userNamingStrategy?: UserNamingStrategies;
    },
  ) {
    const oktaConfigs = config
      .getOptionalConfigArray('catalog.providers.okta')
      ?.map(oktaConfig => {
        const orgUrl = oktaConfig.getString('orgUrl');
        const token = oktaConfig.getString('token');

        const userFilter = oktaConfig.getOptionalString('userFilter');
        const groupFilter = oktaConfig.getOptionalString('groupFilter');

        return { orgUrl, token, groupFilter, userFilter };
      });

    return new OktaOrgEntityProvider(oktaConfigs || [], options);
  }

  constructor(
    accountConfig: AccountConfig[],
    options: {
      logger: winston.Logger;
      groupNamingStrategy?: GroupNamingStrategies;
      userNamingStrategy?: UserNamingStrategies;
    },
  ) {
    super(accountConfig, options);
    this.groupNamingStrategy = groupNamingStrategyFactory(
      options.groupNamingStrategy,
    );
    this.userNamingStrategy = userNamingStrategyFactory(
      options.userNamingStrategy,
    );
  }

  getProviderName(): string {
    return `okta-org:all`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(`Providing okta user and group resources from okta`);
    const resources: (GroupEntity | UserEntity)[] = [];

    await Promise.all(
      this.accounts.map(async account => {
        const client = this.getClient(account.orgUrl);

        const defaultAnnotations = await this.buildDefaultAnnotations();

        await client.listUsers({ search: account.userFilter }).each(user => {
          resources.push(
            userEntityFromOktaUser(user, this.userNamingStrategy, {
              annotations: defaultAnnotations,
            }),
          );
        });

        await client
          .listGroups({ search: account.groupFilter })
          .each(async group => {
            const members: string[] = [];
            await group.listUsers().each(user => {
              members.push(this.userNamingStrategy(user));
            });

            const groupEntity = groupEntityFromOktaGroup(
              group,
              this.groupNamingStrategy,
              { annotations: defaultAnnotations, members },
            );

            if (members.length > 0) {
              resources.push(groupEntity);
            }
          });
      }),
    );

    await this.connection.applyMutation({
      type: 'full',
      entities: resources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
  }
}
