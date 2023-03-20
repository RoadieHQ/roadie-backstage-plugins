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

import { ProfileFieldGroupNamingStrategy } from './ProfileFieldGroupNamingStrategy';
import { Group } from '@okta/okta-sdk-nodejs';

describe('ProfileFiledGroupNamingStrategy', () => {
  it('gets the right field from the group profile', async () => {
    const provider = new ProfileFieldGroupNamingStrategy('org_id');
    const testGroup: Partial<Group> = {
      profile: {
        name: 'group-1',
        description: 'Group 1',
        org_id: '1234',
      },
    };
    expect(provider.nameForGroup(testGroup as Group)).toEqual('1234');
  });

  it('fails if the field is not set', async () => {
    const provider = new ProfileFieldGroupNamingStrategy('org_id');
    const testGroup: Partial<Group> = {
      profile: {
        name: 'group-1',
        description: 'Group 1',
      },
    };
    expect(() => provider.nameForGroup(testGroup as Group)).toThrow(
      'Profile field org_id does not contain a string',
    );
  });

  it('fails if the field is not the right type', async () => {
    const provider = new ProfileFieldGroupNamingStrategy('org_id');
    const testGroup: Partial<Group> = {
      profile: {
        name: 'group-1',
        description: 'Group 1',
        org_id: ['wrong', 'type'],
      },
    };
    expect(() => provider.nameForGroup(testGroup as Group)).toThrow(
      'Profile field org_id does not contain a string',
    );
  });

  it('makes a number a string', async () => {
    const provider = new ProfileFieldGroupNamingStrategy('org_id');
    const testGroup: Partial<Group> = {
      profile: {
        name: 'group-1',
        description: 'Group 1',
        org_id: 1234,
      },
    };
    expect(provider.nameForGroup(testGroup as Group)).toEqual('1234');
  });
});
