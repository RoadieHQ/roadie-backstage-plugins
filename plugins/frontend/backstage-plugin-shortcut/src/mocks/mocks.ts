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

export const storiesResponseMock = {
  data: [
    {
      app_url: 'https://app.shortcut.com/organisation/story/1234',
      description: 'CTA button not working.',
      archived: false,
      started: true,
      entity_type: 'story',
      story_type: 'bug',
      name: 'CTA button not working',
      completed: false,
    },
    {
      app_url: 'https://app.shortcut.com/organisation/story/12345',
      description: 'Add some new feature for CTA button',
      archived: false,
      started: true,
      entity_type: 'story',
      story_type: 'feature',
      name: 'New feature request CTA button',
      completed: false,
    },
    {
      app_url: 'https://app.shortcut.com/organisation/story/123456',
      archived: false,
      started: true,
      entity_type: 'chore',
      story_type: 'bug',
      name: 'Completed chore for CTA button',
      completed: true,
    },
  ],
  total: 3,
};

export const usersResponseMock = [
  {
    role: 'member',
    entity_type: 'member',
    id: '1234-5647-47da-qwerty-11wwee',
    profile: {
      entity_type: 'profile',
      deactivated: false,
      two_factor_auth_activated: false,
      mention_name: 'testuser',
      name: 'Test User',
      email_address: 'test@user.com',
    },
  },
  {
    role: 'member',
    entity_type: 'member',
    id: '4321-7654-47da-qwerty-11wwee',
    profile: {
      entity_type: 'profile',
      deactivated: false,
      two_factor_auth_activated: false,
      mention_name: 'testuser2',
      name: 'Test User2',
      email_address: 'test2@user.com',
    },
  },
];
