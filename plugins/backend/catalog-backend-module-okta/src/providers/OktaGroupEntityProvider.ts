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
import { ANNOTATION_LOCATION, GroupEntity } from '@backstage/catalog-model';
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
import { OktaGroup, OktaGroupEntityTransformer, asOktaUser } from './types';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';

const DEFAULT_CHUNK_SIZE = 250;
const DEFAULT_MEMBERSHIP_TIMESTAMP_ANNOTATION =
  'okta.roadie.io/last-membership-updated';

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
  // set iff skipUnchangedGroups is enabled
  private readonly skipUnchangedGroups: boolean;
  private readonly catalogAccess:
    | { catalogClient: CatalogService; auth: AuthService }
    | undefined;
  private readonly membershipTimestampAnnotation: string;

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
      skipUnchangedGroups?: boolean;
      catalogClient?: CatalogService;
      auth?: AuthService;
      membershipTimestampAnnotation?: string;
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
    this.skipUnchangedGroups = options.skipUnchangedGroups ?? false;
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

    const previousGroups = this.catalogAccess
      ? await this.loadPreviousGroups(this.catalogAccess)
      : new Map<string, GroupEntity>();
    const reusedGroupIds = new Set<string>();

    for (const entries of chunk(Object.entries(oktaGroups), this.chunkSize)) {
      await Promise.allSettled(
        entries.map(async ([_, group]) => {
          // compute only with SkipUnchangedGroups, so all group members are fetched by default
          const updated = group.lastMembershipUpdated;
          const timestamp =
            this.skipUnchangedGroups &&
            this.catalogAccess &&
            updated instanceof Date &&
            !Number.isNaN(updated.getTime())
              ? updated.toISOString()
              : undefined;
          const reusable = timestamp
            ? this.reusableMembers(group, timestamp, previousGroups)
            : undefined;
          const members: string[] = reusable ? [...reusable] : [];
          if (!reusable) {
            this.logger.info(
              `${group.id} changed, fetching updated member list`,
            );
            try {
              const groupUsers = await client.groupApi.listGroupUsers({
                groupId: group.id,
              });
              await groupUsers.each(rawUser => {
                const user = asOktaUser(rawUser);
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
          }

          const parentGroup = getParentGroup({
            parentKey: this.hierarchyConfig?.parentKey,
            group,
            oktaGroups,
          });
          const profileAnnotations: Record<string, string> = {};
          if (this.customAttributesToAnnotationAllowlist.length) {
            for (const [key, value] of Object.entries(group.profile)) {
              if (
                this.customAttributesToAnnotationAllowlist.includes(key) &&
                value !== undefined &&
                value !== null
              ) {
                profileAnnotations[key] = String(value);
              }
            }
          }
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
              this.namingStrategy,
              {
                annotations,
                members,
              },
              parentGroup,
            );
            groupResources.push(groupEntity);
            if (reusable) {
              reusedGroupIds.add(group.id);
            }
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
      `Finished providing ${groupResources.length} group resources from okta: ${
        this.orgUrl
      }${
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
          this.logger.info(
            `retrieved group ${
              entity.metadata.name
            } with annotations ${JSON.stringify(entity.metadata.annotations)}`,
          );
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
    const previous = previousGroups.get(this.namingStrategy(group));
    if (
      previous?.metadata.annotations?.[this.membershipTimestampAnnotation] !==
      timestamp
    ) {
      return undefined;
    }
    return previous.spec?.members ?? [];
  }
}
