/*
 * Copyright 2020 RoadieHQ
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

import React from 'react';
import { render } from '@testing-library/react';
import {
  configApiRef,
  githubAuthApiRef,
} from '@backstage/core-plugin-api';
import {
  ApiRegistry,
  ApiProvider,
} from '@backstage/core-app-api';
import { rest } from 'msw';
import { msw } from '@backstage/test-utils';
// eslint-disable-next-line
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { alertsResponseMock, entityMock } from '../../mocks/mocks';
import { SecurityInsightsWidget } from './SecurityInsightsWidget';
import { EntityProvider } from '@backstage/plugin-catalog-react';

const mockGithubAuth = {
  getAccessToken: async (_: string[]) => 'test-token',
};

const config = {
  getOptionalConfigArray: (_: string) => [
    { getOptionalString: (_other: string) => undefined },
  ],
};

const apis = ApiRegistry.from([
  [configApiRef, config],
  [githubAuthApiRef, mockGithubAuth],
]);

describe('PullRequestsCard', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => {
    worker.use(
      rest.get(
        'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts',
        (_, res, ctx) => res(ctx.json(alertsResponseMock))
      )
    );
  });

  it('should display an ovreview card with the data from the requests', async () => {
    const rendered = render(
      <MemoryRouter>
        <ApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <SecurityInsightsWidget />
          </EntityProvider>
        </ApiProvider>
      </MemoryRouter>
    );
    expect(await rendered.findByText('8 Warning')).toBeInTheDocument();
  });
});
