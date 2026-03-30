/*
 * Copyright 2021 Larder Software Limited
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

// `msw` is included as a dev dependency and these mocks are only used in tests.
// The linter gets a bit confused because this file doesn't look like a test.
// eslint-disable-next-line @backstage/no-undeclared-imports
import { rest } from 'msw';
import { storiesResponseMock, usersResponseMock } from './mocks';

export const handlers = [
  rest.get('http://exampleapi.com/shortcut/api/members', (_, res, ctx) => {
    return res(ctx.json(usersResponseMock));
  }),
  rest.get(
    'http://exampleapi.com/shortcut/api/search/stories',
    (req, res, ctx) => {
      const pageSize = req.url.searchParams.get('page_size');
      const query = req.url.searchParams.get('query');
      if (query === 'owner:testuser' && pageSize === '25') {
        return res(ctx.json(storiesResponseMock));
      }
      return res(ctx.json(storiesResponseMock));
    },
  ),
];
