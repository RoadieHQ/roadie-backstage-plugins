/*
 * Copyright 2025 Larder Software Limited
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

import { rest } from 'msw';
import {
  branchesResponseMock,
  contributorsResponseMock,
  environmentsResponseMock,
  languagesResponseMock,
  licenseResponseMock,
  releasesResponseMock,
  readmeResponseMock,
} from './mocks';

export const handlers = [
  rest.get(
    'https://api.github.com/repos/mcalus3/backstage/contents/LICENSE',
    (_, res, ctx) => res(ctx.json(licenseResponseMock)),
  ),
  rest.get(
    'https://api.github.com/repos/mcalus3/backstage/branches',
    (_, res, ctx) => res(ctx.json(branchesResponseMock)),
  ),
  rest.get(
    'https://api.github.com/repos/mcalus3/backstage/contributors',
    (_, res, ctx) => res(ctx.json(contributorsResponseMock)),
  ),
  rest.get(
    'https://api.github.com/repos/mcalus3/backstage/environments',
    (_, res, ctx) => res(ctx.json(environmentsResponseMock)),
  ),
  rest.get(
    'https://api.github.com/repos/mcalus3/backstage/languages',
    (_, res, ctx) => res(ctx.json(languagesResponseMock)),
  ),
  rest.get(
    'https://api.github.com/repos/mcalus3/backstage/releases',
    (_, res, ctx) => res(ctx.json(releasesResponseMock)),
  ),
  rest.get(
    'https://api.github.com/repos/mcalus3/backstage/readme',
    (_, res, ctx) => res(ctx.json(readmeResponseMock)),
  ),
];
