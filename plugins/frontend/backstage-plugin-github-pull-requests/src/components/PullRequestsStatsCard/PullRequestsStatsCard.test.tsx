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

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  configApiRef,
  githubAuthApiRef,
  AnyApiRef,
} from '@backstage/core-plugin-api';
import {
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { githubPullRequestsApiRef } from '../..';
import { GithubPullRequestsClient } from '../../api';
import { entityMock } from '../../mocks/mocks';
import PullRequestsStatsCard from './PullRequestsStatsCard';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { handlers } from '../../mocks/handlers';

const mockGithubAuth = {
  getAccessToken: async (_: string[]) => 'test-token',
};

const config = {
  getOptionalConfigArray: (_: string) => [
    { getOptionalString: (_s: string) => undefined },
  ],
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [configApiRef, config],
  [githubAuthApiRef, mockGithubAuth],
  [githubPullRequestsApiRef, new GithubPullRequestsClient()],
];

describe('PullRequestsCard', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);
  afterEach(() => {
    worker.resetHandlers();
  });
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
    expect(await screen.findByText('2 months')).toBeInTheDocument();
    expect(await screen.findByText('67%')).toBeInTheDocument();
    expect(await screen.findByText('3309 lines')).toBeInTheDocument();
  });
});
