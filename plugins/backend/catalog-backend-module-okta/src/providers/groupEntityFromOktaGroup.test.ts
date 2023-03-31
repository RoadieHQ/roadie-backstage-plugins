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

import { groupEntityFromOktaGroup } from './groupEntityFromOktaGroup';
import { Group } from '@okta/okta-sdk-nodejs';
import { ProfileFieldGroupNamingStrategy } from './groupNamingStrategies';

describe('groupEntityFromOktaGroup', () => {
  it('ignores an empty parent', async () => {
    const group: Partial<Group> = {
      profile: {
        name: 'group-1',
        description: 'Group 1',
        parent_org_id: '',
        org_id: '1',
      },
    };
    const parentGroup = undefined;
    const options = {
      annotations: {},
      members: [],
    };
    expect(
      groupEntityFromOktaGroup(
        group as Group,
        new ProfileFieldGroupNamingStrategy('org_id').nameForGroup,
        parentGroup,
        options,
      ),
    ).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        annotations: {},
        description: 'Group 1',
        name: '1',
        title: 'group-1',
      },
      spec: { children: [], members: [], parent: undefined, type: 'group' },
    });
  });

  it('sets a empty parent id string', async () => {
    const group: Partial<Group> = {
      profile: {
        name: 'group-2',
        description: 'Group 2',
        parent_org_id: '1',
        org_id: '2',
      },
    };
    const parentGroup: Partial<Group> = {
      profile: {
        name: 'group-1',
        description: 'Group 1',
        org_id: '1',
      },
    };
    const options = {
      annotations: {},
      members: [],
    };
    expect(
      groupEntityFromOktaGroup(
        group as Group,
        new ProfileFieldGroupNamingStrategy('org_id').nameForGroup,
        parentGroup as Group,
        options,
      ),
    ).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        annotations: {},
        description: 'Group 2',
        name: '2',
        title: 'group-2',
      },
      spec: { children: [], members: [], parent: '1', type: 'group' },
    });
  });
});
