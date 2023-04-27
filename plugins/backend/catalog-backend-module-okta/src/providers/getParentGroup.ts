/*
 * Copyright 2023 Larder Software Limited
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
import get from 'lodash/get';

type GetParentGroupsOptions = {
  parentKey?: string;
  group: Group;
  oktaGroups: Record<string, Group>;
};

export const getParentGroup = (opts: GetParentGroupsOptions) => {
  const { parentKey, group, oktaGroups } = opts;
  let parentGroup: Group | undefined = undefined;

  if (parentKey) {
    const parentId = get(group, parentKey);
    if (typeof parentId === 'string') {
      parentGroup = oktaGroups[parentId];
    }
    if (typeof parentId === 'number') {
      parentGroup = oktaGroups[parentId.toString()];
    }
  }

  return parentGroup;
};
