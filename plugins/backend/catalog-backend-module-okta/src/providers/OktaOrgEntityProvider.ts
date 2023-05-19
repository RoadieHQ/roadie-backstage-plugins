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
} from './groupNamingStrategies';
import {
  UserNamingStrategies,
  UserNamingStrategy,
  userNamingStrategyFactory,
} from './userNamingStrategies';
import { userEntityFromOktaUser } from './userEntityFromOktaUser';
import { AccountConfig } from '../types';
import { groupEntityFromOktaGroup } from './groupEntityFromOktaGroup';
import { getAccountConfig } from './accountConfig';
import { isError } from '@backstage/errors';
import { getOktaGroups } from './getOktaGroups';
import { getParentGroup } from './getParentGroup';
import { GroupTree } from './GroupTree';

/**
 * Provides entities from Okta Org service.
 */
export class OktaOrgEntityProvider extends OktaEntityProvider {
  private readonly groupNamingStrategy: GroupNamingStrategy;
  private readonly userNamingStrategy: UserNamingStrategy;
  private readonly includeEmptyGroups: boolean;
  private readonly hierarchyConfig:
    | { parentKey: string; key?: string }
    | undefined;
  private readonly customAttributesToAnnotationAllowlist: string[];

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      groupNamingStrategy?: GroupNamingStrategies | GroupNamingStrategy;
      userNamingStrategy?: UserNamingStrategies | UserNamingStrategy;
      includeEmptyGroups?: boolean;
      /*
       * @deprecated, please use hierarchyConfig.parentKey
       */
      parentGroupField?: string;
      hierarchyConfig?: {
        parentKey: string;
        key?: string;
      };
      customAttributesToAnnotationAllowlist?: string[];
    },
  ) {
    const oktaConfigs = config
      .getOptionalConfigArray('catalog.providers.okta')
      ?.map(getAccountConfig);

    if (options.parentGroupField && !options.hierarchyConfig?.parentKey) {
      options.hierarchyConfig = {
        parentKey: `profile.${options.parentGroupField}`,
      };
    }
    return new OktaOrgEntityProvider(oktaConfigs || [], options);
  }

  constructor(
    accountConfigs: AccountConfig[],
    options: {
      logger: winston.Logger;
      groupNamingStrategy?: GroupNamingStrategies | GroupNamingStrategy;
      userNamingStrategy?: UserNamingStrategies | UserNamingStrategy;
      includeEmptyGroups?: boolean;
      hierarchyConfig?: {
        parentKey: string;
        key?: string;
      };
      customAttributesToAnnotationAllowlist?: string[];
    },
  ) {
    super(accountConfigs, options);
    this.groupNamingStrategy = groupNamingStrategyFactory(
      options.groupNamingStrategy,
    );
    this.userNamingStrategy = userNamingStrategyFactory(
      options.userNamingStrategy,
    );
    this.includeEmptyGroups = !!options.includeEmptyGroups;
    this.hierarchyConfig = options.hierarchyConfig;
    this.customAttributesToAnnotationAllowlist =
      options.customAttributesToAnnotationAllowlist || [];
  }

  getProviderName(): string {
    return `okta-org:all`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info('Providing user and group resources from okta');
    let groupResources: GroupEntity[] = [];
    const userResources: Record<string, UserEntity> = {};
    let providedUserCount = 0;
    let providedGroupCount = 0;

    await Promise.all(
      this.accounts.map(async account => {
        const client = this.getClient(account.orgUrl, [
          'okta.groups.read',
          'okta.users.read',
        ]);

        const defaultAnnotations = await this.buildDefaultAnnotations();

        await client.listUsers({ search: account.userFilter }).each(user => {
          try {
            const userName = this.userNamingStrategy(user);
            userResources[userName] = userEntityFromOktaUser(
              user,
              this.userNamingStrategy,
              {
                annotations: defaultAnnotations,
              },
            );
          } catch (e: unknown) {
            this.logger.warn(
              `Failed to add user: ${isError(e) ? e.message : 'unknown error'}`,
            );
          }
        });

        providedUserCount = Object.values(userResources).length;

        const oktaGroups = await getOktaGroups({
          client,
          groupFilter: account.groupFilter,
          key: this.hierarchyConfig?.key,
          groupNamingStrategy: this.groupNamingStrategy,
          logger: this.logger,
        });

        await Promise.allSettled(
          Object.entries(oktaGroups).map(async ([_, group]) => {
            const members: string[] = [];
            await group.listUsers().each(user => {
              try {
                const userName = this.userNamingStrategy(user);
                if (userResources[userName]) {
                  members.push(userName);
                }
              } catch (e: unknown) {
                this.logger.warn(
                  `failed to add user to group: ${
                    isError(e) ? e.message : 'unknown error'
                  }`,
                );
              }
            });

            const parentGroup = getParentGroup({
              parentKey: this.hierarchyConfig?.parentKey,
              group,
              oktaGroups,
            });

            const profileAnnotations = this.getCustomAnnotations(
              group,
              this.customAttributesToAnnotationAllowlist,
            );

            const annotations = {
              ...defaultAnnotations,
              ...profileAnnotations,
            };
            try {
              const groupEntity = groupEntityFromOktaGroup(
                group,
                this.groupNamingStrategy,
                parentGroup,
                {
                  annotations,
                  members,
                },
              );
              groupResources.push(groupEntity);
            } catch (e: unknown) {
              this.logger.warn(
                `failed to add group: ${
                  isError(e) ? e.message : 'unknown error'
                }`,
              );
            }
          }),
        );
      }),
    );

    if (!this.includeEmptyGroups) {
      this.logger.info(
        `Found ${groupResources.length}, pruning the empty ones`,
      );
      groupResources = new GroupTree(groupResources).getGroups({
        pruneEmptyMembers: true,
      });
    }

    providedGroupCount = groupResources.length;
    await this.connection.applyMutation({
      type: 'full',
      entities: [...Object.values(userResources), ...groupResources].map(
        entity => ({
          entity,
          locationKey: this.getProviderName(),
        }),
      ),
    });

    this.logger.info(
      `Finished providing ${providedUserCount} user and ${providedGroupCount} group resources from okta`,
    );
  }
}
