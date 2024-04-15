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
import { userEntityFromOktaUser as defaultUserEntityFromOktaUser } from './userEntityFromOktaUser';
import { AccountConfig } from '../types';
import { groupEntityFromOktaGroup as defaultGroupEntityFromOktaGroup } from './groupEntityFromOktaGroup';
import { getAccountConfigs } from './accountConfig';
import { isError } from '@backstage/errors';
import { getOktaGroups } from './getOktaGroups';
import { getParentGroup } from './getParentGroup';
import { GroupTree } from './GroupTree';
import { OktaGroupEntityTransformer, OktaUserEntityTransformer } from './types';
import chunk from 'lodash/chunk';
import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import * as uuid from 'uuid';

/**
 * Provides entities from Okta Org service.
 */
export class OktaOrgEntityProvider extends OktaEntityProvider {
  private readonly groupNamingStrategy: GroupNamingStrategy;
  private readonly userNamingStrategy: UserNamingStrategy;
  private readonly groupEntityFromOktaGroup: OktaGroupEntityTransformer;
  private readonly userEntityFromOktaUser: OktaUserEntityTransformer;
  private readonly includeEmptyGroups: boolean;
  private readonly hierarchyConfig:
    | { parentKey: string; key?: string }
    | undefined;
  private readonly customAttributesToAnnotationAllowlist: string[];
  private readonly chunkSize: number;
  private readonly taskRunner: TaskRunner;

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      groupNamingStrategy?: GroupNamingStrategies | GroupNamingStrategy;
      userNamingStrategy?: UserNamingStrategies | UserNamingStrategy;
      groupTransformer?: OktaGroupEntityTransformer;
      userTransformer?: OktaUserEntityTransformer;
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
      chunkSize?: number;
      schedule?: TaskRunner;
      scheduler?: PluginTaskScheduler;
    },
  ) {
    if (!options.schedule && !options.scheduler) {
      throw new Error('Either schedule or scheduler must be provided.');
    }

    if (options.parentGroupField && !options.hierarchyConfig?.parentKey) {
      options.hierarchyConfig = {
        parentKey: `profile.${options.parentGroupField}`,
      };
    }

    return getAccountConfigs(config).map(accountConfig => {
      if (!options.schedule && !accountConfig.schedule) {
        throw new Error(
          `No schedule provided neither via code nor config for okta-provider:${accountConfig.id}.`,
        );
      }

      const taskRunner =
        options.schedule ??
        options.scheduler!.createScheduledTaskRunner(accountConfig.schedule!);

      return new OktaOrgEntityProvider(accountConfig, {
        ...options,
        taskRunner,
      });
    });
  }

  constructor(
    accountConfig: AccountConfig,
    options: {
      logger: winston.Logger;
      groupNamingStrategy?: GroupNamingStrategies | GroupNamingStrategy;
      userNamingStrategy?: UserNamingStrategies | UserNamingStrategy;
      groupTransformer?: OktaGroupEntityTransformer;
      userTransformer?: OktaUserEntityTransformer;
      includeEmptyGroups?: boolean;
      hierarchyConfig?: {
        parentKey: string;
        key?: string;
      };
      customAttributesToAnnotationAllowlist?: string[];
      chunkSize?: number;
      taskRunner: TaskRunner;
    },
  ) {
    super(accountConfig, options);
    this.groupNamingStrategy = groupNamingStrategyFactory(
      options.groupNamingStrategy,
    );
    this.userNamingStrategy = userNamingStrategyFactory(
      options.userNamingStrategy,
    );
    this.groupEntityFromOktaGroup =
      options?.groupTransformer || defaultGroupEntityFromOktaGroup;
    this.userEntityFromOktaUser =
      options.userTransformer || defaultUserEntityFromOktaUser;
    this.includeEmptyGroups = !!options.includeEmptyGroups;
    this.hierarchyConfig = options.hierarchyConfig;
    this.customAttributesToAnnotationAllowlist =
      options.customAttributesToAnnotationAllowlist || [];
    this.chunkSize = options.chunkSize || 250;
    this.taskRunner = options.taskRunner;
  }

  /** {@inheritdoc @backstage/plugin-catalog-backend#EntityProvider.getProviderName} */
  getProviderName(): string {
    return `provider-okta:${this.account.id}`;
  }

  /** {@inheritdoc @backstage/plugin-catalog-backend#EntityProvider.connect} */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.taskRunner.run({
      id: `${this.getProviderName()}:refresh`,
      fn: async () => {
        const logger = this.logger.child({
          class: OktaOrgEntityProvider.prototype.constructor.name,
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

    this.logger.info('Providing user and group resources from okta');
    let groupResources: GroupEntity[] = [];
    const userResources: Record<string, UserEntity> = {};
    let providedUserCount = 0;
    let providedGroupCount = 0;

    const client = this.getClient(this.account.orgUrl, [
      'okta.groups.read',
      'okta.users.read',
    ]);

    const defaultAnnotations = await this.buildDefaultAnnotations();

    await client.listUsers({ search: this.account.userFilter }).each(user => {
      try {
        const userName = this.userNamingStrategy(user);
        userResources[userName] = this.userEntityFromOktaUser(
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
      groupFilter: this.account.groupFilter,
      key: this.hierarchyConfig?.key,
      groupNamingStrategy: this.groupNamingStrategy,
      logger: this.logger,
    });

    for (const chunkOfGroups of chunk(
      Object.values(oktaGroups),
      this.chunkSize,
    )) {
      const promiseResults = await Promise.allSettled(
        chunkOfGroups.map(async group => {
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
            const groupEntity = this.groupEntityFromOktaGroup(
              group,
              this.groupNamingStrategy,
              {
                annotations,
                members,
              },
              parentGroup,
            );
            return groupEntity;
          } catch (e: unknown) {
            throw new Error(
              `failed to add group: ${
                isError(e) ? e.message : 'unknown error'
              }`,
            );
          }
        }),
      );
      for (const promise of promiseResults) {
        if (promise.status === 'fulfilled') {
          groupResources.push(promise.value);
        } else {
          this.logger.info(
            isError(promise.reason) ? promise.reason.message : 'unknown error',
          );
        }
      }
    }

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
