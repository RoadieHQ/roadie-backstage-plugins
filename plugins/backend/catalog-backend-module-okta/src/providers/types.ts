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
import type {
  Group,
  GroupProfile,
  User,
  UserProfile,
} from '@okta/okta-sdk-nodejs';
import { GroupNamingStrategy } from './groupNamingStrategies';
import { UserNamingStrategy } from './userNamingStrategies';

/**
 * Stricter wrapper around the SDK `UserProfile`. The Okta API always returns
 * an `email` for active users, but the generated SDK types mark it optional.
 */
export type OktaUserProfile = UserProfile & { email: string };

/**
 * Stricter wrapper around the SDK `User`. `id` and `profile.email` are always
 * present at runtime on results returned by `listUsers` / `listGroupUsers`,
 * even though the generated SDK types mark them optional.
 */
export type OktaUser = User & { id: string; profile: OktaUserProfile };

/**
 * Stricter wrapper around the SDK `GroupProfile`. The Okta API always returns
 * a `name`, but the generated SDK types mark it optional.
 */
export type OktaGroupProfile = GroupProfile & { name: string };

/**
 * Stricter wrapper around the SDK `Group`. `id` and `profile.name` are always
 * present at runtime on results returned by `listGroups`, even though the
 * generated SDK types mark them optional.
 */
export type OktaGroup = Group & { id: string; profile: OktaGroupProfile };

/**
 * Narrow an SDK `User` to `OktaUser` at the SDK boundary. The cast is safe
 * for results returned by `listUsers` and `listGroupUsers`.
 */
export const asOktaUser = (user: User): OktaUser => user as OktaUser;

/**
 * Narrow an SDK `Group` to `OktaGroup` at the SDK boundary. The cast is safe
 * for results returned by `listGroups`.
 */
export const asOktaGroup = (group: Group): OktaGroup => group as OktaGroup;

export type OktaGroupEntityTransformer = (
  group: OktaGroup,
  namingStrategy: GroupNamingStrategy,
  options: {
    annotations: Record<string, string>;
    members: string[];
  },
  parentGroup?: OktaGroup,
) => GroupEntity;

export type OktaUserEntityTransformer = (
  user: OktaUser,
  namingStrategy: UserNamingStrategy,
  options: { annotations: Record<string, string> },
) => UserEntity;
