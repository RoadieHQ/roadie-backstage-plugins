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

import {
  ANNOTATION_LOCATION,
  GroupEntity,
  UserEntity,
} from '@backstage/catalog-model';
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
import { getAccountConfig } from './accountConfig';
import { isError } from '@backstage/errors';
import { getOktaGroups } from './getOktaGroups';
import { getParentGroup } from './getParentGroup';
import { GroupTree } from './GroupTree';
import {
  OktaGroup,
  OktaGroupEntityTransformer,
  OktaUserEntityTransformer,
  asOktaUser,
} from './types';
import chunk from 'lodash/chunk';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';

const DEFAULT_CHUNK_SIZE = 250;
const DEFAULT_MEMBERSHIP_TIMESTAMP_ANNOTATION =
  'okta.roadie.io/last-membership-updated';

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
  // set iff skipUnchangedGroups is enabled
  private readonly catalogAccess:
    | { catalogClient: CatalogService; auth: AuthService }
    | undefined;
  private readonly membershipTimestampAnnotation: string;

  static fromConfig(
    config: Config,
    options: {
      logger: LoggerService;
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
      /**
       * Skip `listGroupUsers` for groups whose Okta `lastMembershipUpdated`
       * matches the timestamp annotation on the group's existing catalog
       * entity, reusing that entity's `spec.members`. Requires
       * `catalogClient` and `auth`. Defaults to false.
       *
       * A custom `groupTransformer` must emit `members` unchanged, since the
       * cached members are matched against user entity names. A user whose
       * entity name changes (e.g. an email change with an email-based user
       * naming strategy) is missing from unchanged groups until Okta updates
       * that group's membership.
       */
      skipUnchangedGroups?: boolean;
      catalogClient?: CatalogService;
      auth?: AuthService;
      /**
       * Annotation storing the group's `lastMembershipUpdated`.
       * Defaults to `okta.roadie.io/last-membership-updated`.
       */
      membershipTimestampAnnotation?: string;
    },
  ) {
    const oktaConfig = getAccountConfig(config);

    if (options.parentGroupField && !options.hierarchyConfig?.parentKey) {
      options.hierarchyConfig = {
        parentKey: `profile.${options.parentGroupField}`,
      };
    }
    return new OktaOrgEntityProvider(oktaConfig, options);
  }

  constructor(
    accountConfig: AccountConfig,
    options: {
      logger: LoggerService;
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
      skipUnchangedGroups?: boolean;
      catalogClient?: CatalogService;
      auth?: AuthService;
      membershipTimestampAnnotation?: string;
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
    this.chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
    if (options.skipUnchangedGroups) {
      if (!options.catalogClient || !options.auth) {
        throw new Error('skipUnchangedGroups requires catalogClient and auth');
      }
      this.catalogAccess = {
        catalogClient: options.catalogClient,
        auth: options.auth,
      };
    }
    this.membershipTimestampAnnotation =
      options.membershipTimestampAnnotation ||
      DEFAULT_MEMBERSHIP_TIMESTAMP_ANNOTATION;
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
    const reusedGroupIds = new Set<string>();

    const client = this.getClient(this.account.orgUrl, [
      'okta.groups.read',
      'okta.users.read',
    ]);

    const defaultAnnotations = await this.buildDefaultAnnotations();

    const allUsers = await client.userApi.listUsers({
      search: this.account.userFilter,
    });
    await allUsers.each(rawUser => {
      const user = asOktaUser(rawUser);
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

    const previousGroups = this.catalogAccess
      ? await this.loadPreviousGroups(this.catalogAccess)
      : new Map<string, GroupEntity>();

    for (const chunkOfGroups of chunk(
      Object.values(oktaGroups),
      this.chunkSize,
    )) {
      const promiseResults = await Promise.allSettled(
        chunkOfGroups.map(async group => {
          // computed only with skipUnchangedGroups, so the default path stays
          // as upstream; anything but a valid Date means the members are fetched
          const updated = group.lastMembershipUpdated;
          const timestamp =
            this.catalogAccess &&
            updated instanceof Date &&
            !Number.isNaN(updated.getTime())
              ? updated.toISOString()
              : undefined;
          const reusable = timestamp
            ? this.reusableMembers(group, timestamp, previousGroups)
            : undefined;
          // same rule as fetched members: only users emitted in this run
          const members: string[] = reusable
            ? reusable.filter(userName => userResources[userName])
            : [];
          if (!reusable) {
            const groupUsers = await client.groupApi.listGroupUsers({
              groupId: group.id,
            });
            await groupUsers.each(rawUser => {
              const user = asOktaUser(rawUser);
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
          }

          const parentGroup = getParentGroup({
            parentKey: this.hierarchyConfig?.parentKey,
            group,
            oktaGroups,
          });

          const profileAnnotations = this.getCustomAnnotations(
            group,
            this.customAttributesToAnnotationAllowlist,
          );

          const annotations: Record<string, string> = {
            ...defaultAnnotations,
            ...profileAnnotations,
          };
          if (timestamp) {
            annotations[this.membershipTimestampAnnotation] = timestamp;
          }
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
            if (reusable) {
              reusedGroupIds.add(group.id);
            }
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
        `Found ${groupResources.length} groups in okta, pruning the empty ones`,
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
      `Finished providing ${providedUserCount} user and ${providedGroupCount} group resources from okta${
        this.catalogAccess
          ? ` (${reusedGroupIds.size} groups reused unchanged membership)`
          : ''
      }`,
    );
  }

  /**
   * This provider's previously emitted groups, keyed by entity name. Empty on
   * catalog failure, so every group's members are fetched from Okta.
   */
  private async loadPreviousGroups(catalogAccess: {
    catalogClient: CatalogService;
    auth: AuthService;
  }): Promise<Map<string, GroupEntity>> {
    const previousGroups = new Map<string, GroupEntity>();
    try {
      const credentials = await catalogAccess.auth.getOwnServiceCredentials();
      const pages = catalogAccess.catalogClient.streamEntities(
        {
          filter: {
            kind: 'Group',
            [`metadata.annotations.${ANNOTATION_LOCATION}`]:
              this.getProviderName(),
          },
          fields: ['metadata.name', 'metadata.annotations', 'spec.members'],
        },
        { credentials },
      );
      for await (const page of pages) {
        for (const entity of page) {
          previousGroups.set(entity.metadata.name, entity as GroupEntity);
        }
      }
    } catch (e: unknown) {
      this.logger.warn(
        `Failed to read previous groups from the catalog, fetching all group members: ${
          isError(e) ? e.message : 'unknown error'
        }`,
      );
    }
    return previousGroups;
  }

  /**
   * Cached members of the group's previous entity when Okta reports the same
   * `lastMembershipUpdated`; undefined when the members must be fetched.
   */
  private reusableMembers(
    group: OktaGroup,
    timestamp: string,
    previousGroups: Map<string, GroupEntity>,
  ): string[] | undefined {
    const previous = previousGroups.get(this.groupNamingStrategy(group));
    if (
      previous?.metadata.annotations?.[this.membershipTimestampAnnotation] !==
      timestamp
    ) {
      return undefined;
    }
    return previous.spec?.members ?? [];
  }
}
