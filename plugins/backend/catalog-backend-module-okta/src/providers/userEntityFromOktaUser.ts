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
import { UserEntity } from '@backstage/catalog-model';
import { User } from '@okta/okta-sdk-nodejs';
import { UserNamingStrategy } from './userNamingStrategies';

export const userEntityFromOktaUser = (
  user: User,
  namingStrategy: UserNamingStrategy,
  options: { annotations: Record<string, string> },
): UserEntity => {
  return {
    kind: 'User',
    apiVersion: 'backstage.io/v1alpha1',
    metadata: {
      annotations: { ...options.annotations },
      name: namingStrategy(user),
      title: user.profile.email,
    },
    spec: {
      profile: {
        displayName: user.profile.displayName,
        email: user.profile.email,
      },
      memberOf: [],
    },
  };
};
