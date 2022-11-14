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
import { includeUser } from './includeUser';
import { User } from '@okta/okta-sdk-nodejs';

describe('includeUser', () => {
  it('does not filter if there are no filters', () => {
    expect(includeUser({} as User, undefined)).toEqual(true);
  });

  it('filters if there are filters', () => {
    expect(
      includeUser({ profile: { organization: 'engineering' } } as User, [
        {
          key: 'profile.organization',
          operator: 'startsWith',
          value: 'software',
        },
      ]),
    ).toEqual(false);
    expect(
      includeUser({ profile: { organization: 'engineering' } } as User, [
        { key: 'profile.organization', operator: 'startsWith', value: 'eng' },
      ]),
    ).toEqual(true);
  });

  it('filters if there are multiple filters', () => {
    expect(
      includeUser({ profile: { organization: 'engineering' } } as User, [
        {
          key: 'profile.organization',
          operator: 'startsWith',
          value: 'engineering',
        },
        { key: 'profile.description', operator: 'equals', value: 'dont-match' },
      ]),
    ).toEqual(false);
    expect(
      includeUser(
        {
          profile: { organization: 'engineering', title: 'Developer' },
        } as User,
        [
          {
            key: 'profile.organization',
            operator: 'startsWith',
            value: 'engineering',
          },
          { key: 'profile.title', operator: 'equals', value: 'Developer' },
        ],
      ),
    ).toEqual(true);
  });
});
