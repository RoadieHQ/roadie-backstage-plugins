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
import { includeGroup } from './includeGroup';
import { Group } from '@okta/okta-sdk-nodejs';

describe('includeGroup', () => {
  it('does not filter if there are no filters', () => {
    expect(includeGroup({} as Group, undefined)).toEqual(true);
  });

  it('filters if there are filters', () => {
    expect(
      includeGroup({ profile: { name: 'group1' } } as Group, [
        { key: 'profile.name', operator: 'startsWith', value: 'group2' },
      ]),
    ).toEqual(false);
    expect(
      includeGroup({ profile: { name: 'group2' } } as Group, [
        { key: 'profile.name', operator: 'startsWith', value: 'group2' },
      ]),
    ).toEqual(true);
  });

  it('filters if there are multiple filters', () => {
    expect(
      includeGroup(
        { profile: { name: 'group1', description: 'group1' } } as Group,
        [
          { key: 'profile.name', operator: 'startsWith', value: 'group2' },
          {
            key: 'profile.description',
            operator: 'equals',
            value: 'dont-match',
          },
        ],
      ),
    ).toEqual(false);
    expect(
      includeGroup(
        { profile: { name: 'group2', description: 'group2' } } as Group,
        [
          { key: 'profile.name', operator: 'startsWith', value: 'group2' },
          { key: 'profile.description', operator: 'equals', value: 'group2' },
        ],
      ),
    ).toEqual(true);
  });
});
