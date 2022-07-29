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

import { Group } from '@okta/okta-sdk-nodejs';
import { kebabCase } from 'lodash';

export type GroupNamingStrategy = (group: Group) => string;
export type GroupNamingStrategies = 'id' | 'kebab-case-name' | undefined;

export const groupNamingStrategyFactory = (
  name: GroupNamingStrategies = "id",
): GroupNamingStrategy => {
  switch (name) {
    case 'id':
      return group => group.id;
    case 'kebab-case-name':
      return group => kebabCase(group.profile.name);
    default:
      throw new Error(`Unknown naming strategy ${name}`);  }
};
