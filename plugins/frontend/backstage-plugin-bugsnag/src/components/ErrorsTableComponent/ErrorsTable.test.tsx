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

import { render } from '@testing-library/react';
import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { AnyApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { rest } from 'msw';
import {
  setupRequestMockHandlers,
  TestApiProvider,
  wrapInTestApp,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { ErrorsTable } from './ErrorsTable';
import {
  ErrorsMock,
  ProjectsMock,
  TrendsMock,
  OrganisationsMock,
} from '../../mock/bugsnag-mocks';
import { bugsnagApiRef } from '../..';
import { BugsnagClient } from '../../api/BugsnagClient';

const postMock = jest.fn();
const errorApiMock = { post: postMock, error$: jest.fn() };
const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');

const apis: [AnyApiRef, Partial<unknown>][] = [
  [errorApiRef, errorApiMock],
  [bugsnagApiRef, new BugsnagClient({ discoveryApi })],
];

describe('BugsnagErrorsTable', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => jest.resetAllMocks());

  it('should render headers in a table', async () => {
    worker.use(
      rest.get(
        'http://exampleapi.com/bugsnag/api/user/organizations',
        (_, res, ctx) => res(ctx.json(OrganisationsMock[0])),
      ),
      rest.get(
        'http://exampleapi.com/bugsnag/api/user/organizations/129876sdfgh/projects',
        (_, res, ctx) => res(ctx.json(ProjectsMock)),
      ),
      rest.get(
        'http://exampleapi.com/bugsnag/api/projects/0987qwert!!/errors',
        (_, res, ctx) => res(ctx.json(ErrorsMock)),
      ),
      rest.get(
        'http://exampleapi.com/bugsnag/api/projects/0987qwert!!/errors/123456qwerty!!/trend',
        (_, res, ctx) => res(ctx.json(TrendsMock)),
      ),
      rest.get(
        'http://exampleapi.com/bugsnag/api/projects/0987qwert!!/errors/123456qwerty2!!/trend',
        (_, res, ctx) => res(ctx.json(TrendsMock)),
      ),
      rest.get(
        'http://exampleapi.com/bugsnag/api/projects/0987qwert!!/errors/123456qwerty3!!/trend',
        (_, res, ctx) => res(ctx.json(TrendsMock)),
      ),
      rest.get(
        'http://exampleapi.com/bugsnag/api/projects/0987qwert!!/errors/123456qwerty4!!/trend',
        (_, res, ctx) => res(ctx.json(TrendsMock)),
      ),
    );

    const rendered = render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <ErrorsTable
            organisationName={OrganisationsMock[0].name}
            project={ProjectsMock[0]}
          />
        </TestApiProvider>,
      ),
    );
    expect(await rendered.findByText('Description')).toBeInTheDocument();
    expect(await rendered.findByText('SyntaxError')).toBeInTheDocument();
    expect(await rendered.findByText('Development, Test')).toBeInTheDocument();
  });
});
