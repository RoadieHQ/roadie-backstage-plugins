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

import chunk from 'lodash/chunk';
import { GroupEntity } from '@backstage/catalog-model';
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
import { getAccountConfig } from './accountConfig';
import { isError } from '@backstage/errors';
import { getOktaGroups } from './getOktaGroups';
import { getParentGroup } from './getParentGroup';
import { OktaGroupEntityTransformer } from './types';
import { LoggerService } from '@backstage/backend-plugin-api';

const DEFAULT_CHUNK_SIZE = 250;

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
  private readonly chunkSize: number;

  static fromConfig(
    config: Config,
    options: {
      logger: LoggerService;
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
      chunkSize?: number;
    },
  ) {
    const accountConfig = getAccountConfig(config);

    if (options.parentGroupField && !options.hierarchyConfig?.parentKey) {
      options.hierarchyConfig = {
        parentKey: options.parentGroupField,
      };
    }

    return new OktaGroupEntityProvider(accountConfig, options);
  }

  constructor(
    accountConfig: AccountConfig,
    options: {
      logger: LoggerService;
      namingStrategy?: GroupNamingStrategies | GroupNamingStrategy;
      userNamingStrategy?: UserNamingStrategies | UserNamingStrategy;
      customAttributesToAnnotationAllowlist?: string[];
      hierarchyConfig?: {
        parentKey: string;
        key?: string;
      };
      groupTransformer?: OktaGroupEntityTransformer;
      chunkSize?: number;
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
    this.chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  }

  getProviderName(): string {
    return `okta-group-${this.orgUrl}`;
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

    for (const entries of chunk(Object.entries(oktaGroups), this.chunkSize)) {
      await Promise.allSettled(
        entries.map(async ([_, group]) => {
          const members: string[] = [];
          try {
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
          } catch (e) {
            this.logger.warn(
              `failed to resolve group membership and add group: ${
                isError(e) ? e.message : 'unknown error'
              }`,
            );
            throw e; // preserves behavior to not create group is membership cannot be resolved
          }

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
              `failed to add group: ${
                isError(e) ? e.message : 'unknown error'
              }`,
            );
          }
        }),
      );
    }

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
