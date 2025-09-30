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

import { render, screen } from '@testing-library/react';
import {
  AnyApiRef,
  ConfigApi,
  configApiRef,
  errorApiRef,
} from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { ScmAuthApi, scmAuthApiRef } from '@backstage/integration-react';
import {
  mockApis,
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { githubPullRequestsApiRef } from '../..';
import { entityMock } from '../../mocks/mocks';
import PullRequestsStatsCard from './PullRequestsStatsCard';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { handlers } from '../../mocks/handlers';
import { GithubPullRequestsApiMock } from '../../mocks/githubPullRequestsApiMock';

const mockScmAuth = {
  getCredentials: async () => ({ token: 'test-token', headers: {} }),
} as ScmAuthApi;

const config = {
  getOptionalConfigArray(_: string) {
    return [
      {
        getOptionalString: (_s: string) => undefined,
        getOptionalConfigArray: (_s: string) => undefined,
      },
    ];
  },
} as ConfigApi;

const errorApiMock = { post: jest.fn(), error$: jest.fn() };

const apis: [AnyApiRef, Partial<unknown>][] = [
  [configApiRef, config],
  [errorApiRef, errorApiMock],
  [scmAuthApiRef, mockScmAuth],
  [githubPullRequestsApiRef, new GithubPullRequestsApiMock()],
  [translationApiRef, mockApis.translation()],
];

describe('PullRequestsCard', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => {
    worker.use(...handlers);
  });
  it('should display an ovreview card with the data from the requests', async () => {
    render(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={entityMock}>
          <PullRequestsStatsCard />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(
      await screen.findByText('Average Time Of PR Until Merge'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Merged To Closed Ratio'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Average Size Of PR')).toBeInTheDocument();
    expect(
      await screen.findByText('Average Changed Files Of PR'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Average Coding Time Of PR'),
    ).toBeInTheDocument();
  });
});
