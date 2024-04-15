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
} from './groupNamingStrategies';
import {
  UserNamingStrategies,
  UserNamingStrategy,
  userNamingStrategyFactory,
} from './userNamingStrategies';
import { AccountConfig } from '../types';
import { groupEntityFromOktaGroup as defaultGroupEntityFromOktaGroup } from './groupEntityFromOktaGroup';
import { DEFAULT_PROVIDER_ID, getAccountConfig } from './accountConfig';
import { isError } from '@backstage/errors';
import { getOktaGroups } from './getOktaGroups';
import { getParentGroup } from './getParentGroup';
import { OktaGroupEntityTransformer } from './types';
import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import * as uuid from 'uuid';

/**
 * Provides entities from Okta Group service.
 */
export class OktaGroupEntityProvider extends OktaEntityProvider {
  private readonly namingStrategy: GroupNamingStrategy;
  private readonly userNamingStrategy: UserNamingStrategy;
  private readonly groupEntityFromOktaGroup: OktaGroupEntityTransformer;
  private readonly groupFilter: string | undefined;
  private readonly orgUrl: string;
  private readonly customAttributesToAnnotationAllowlist: string[];
  private hierarchyConfig: { parentKey: string; key?: string } | undefined;
  private readonly taskRunner: TaskRunner;

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      namingStrategy?: GroupNamingStrategies | GroupNamingStrategy;
      userNamingStrategy?: UserNamingStrategies | UserNamingStrategy;
      groupTransformer?: OktaGroupEntityTransformer;
      customAttributesToAnnotationAllowlist?: string[];
      /*
       * @deprecated, please use hierarchyConfig.parentKey
       */
      parentGroupField?: string;
      hierarchyConfig?: {
        parentKey: string;
        key?: string;
      };
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

    if (options.parentGroupField && !options.hierarchyConfig?.parentKey) {
      options.hierarchyConfig = {
        parentKey: options.parentGroupField,
      };
    }

    return new OktaGroupEntityProvider(accountConfig, {
      ...options,
      taskRunner,
    });
  }

  constructor(
    accountConfig: AccountConfig,
    options: {
      logger: winston.Logger;
      namingStrategy?: GroupNamingStrategies | GroupNamingStrategy;
      userNamingStrategy?: UserNamingStrategies | UserNamingStrategy;
      customAttributesToAnnotationAllowlist?: string[];
      hierarchyConfig?: {
        parentKey: string;
        key?: string;
      };
      groupTransformer?: OktaGroupEntityTransformer;
      taskRunner: TaskRunner;
    },
  ) {
    super(accountConfig, options);
    this.namingStrategy = groupNamingStrategyFactory(options.namingStrategy);
    this.userNamingStrategy = userNamingStrategyFactory(
      options.userNamingStrategy,
    );
    this.groupEntityFromOktaGroup =
      options?.groupTransformer || defaultGroupEntityFromOktaGroup;
    this.orgUrl = accountConfig.orgUrl;
    this.groupFilter = accountConfig.groupFilter;
    this.customAttributesToAnnotationAllowlist =
      options.customAttributesToAnnotationAllowlist || [];
    this.hierarchyConfig = options.hierarchyConfig;
    this.taskRunner = options.taskRunner;
  }

  getProviderName(): string {
    return `provider-okta-group:${this.account.id}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.taskRunner.run({
      id: `${this.getProviderName()}:refresh`,
      fn: async () => {
        const logger = this.logger.child({
          class: OktaGroupEntityProvider.prototype.constructor.name,
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

    this.logger.info(`Providing group resources from okta: ${this.orgUrl}`);
    const groupResources: GroupEntity[] = [];

    const client = this.getClient(this.orgUrl, ['okta.groups.read']);

    const defaultAnnotations = await this.buildDefaultAnnotations();

    const oktaGroups = await getOktaGroups({
      client,
      groupFilter: this.groupFilter,
      groupNamingStrategy: this.namingStrategy,
      key: this.hierarchyConfig?.key,
      logger: this.logger,
    });

    await Promise.allSettled(
      Object.entries(oktaGroups).map(async ([_, group]) => {
        const members: string[] = [];
        await group.listUsers().each(user => {
          try {
            const userName = this.userNamingStrategy(user);
            members.push(userName);
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
        const profileAnnotations: Record<string, string> = {};
        if (this.customAttributesToAnnotationAllowlist.length) {
          for (const [key, value] of new Map(Object.entries(group.profile))) {
            const stringKey = key.toString();
            if (
              this.customAttributesToAnnotationAllowlist.includes(stringKey)
            ) {
              profileAnnotations[stringKey] = value.toString();
            }
          }
        }
        const annotations = {
          ...defaultAnnotations,
          ...profileAnnotations,
        };
        try {
          const groupEntity = this.groupEntityFromOktaGroup(
            group,
            this.namingStrategy,
            {
              annotations,
              members,
            },
            parentGroup,
          );
          groupResources.push(groupEntity);
        } catch (e) {
          this.logger.warn(
            `failed to add group: ${isError(e) ? e.message : 'unknown error'}`,
          );
        }
      }),
    );

    await this.connection.applyMutation({
      type: 'full',
      entities: groupResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
    this.logger.info(
      `Finished providing ${groupResources.length} group resources from okta: ${this.orgUrl}`,
    );
  }
}
