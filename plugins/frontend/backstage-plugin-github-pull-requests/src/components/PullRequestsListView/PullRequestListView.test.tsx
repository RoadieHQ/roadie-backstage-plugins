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
import { render, screen, cleanup } from '@testing-library/react';
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
import { PullRequestsListView } from './PullRequestsListView';
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
];

describe('PullRequestsTable', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);
  afterEach(() => {
    worker.resetHandlers();
    cleanup();
  });
  beforeEach(() => {
    worker.use(...handlers);
  });
  it('should display the emptyStateText when no data is provided', async () => {
    render(
      <TestApiProvider apis={apis}>
        <PullRequestsListView data={[]} emptyStateText="foo bar empty" />
      </TestApiProvider>,
    );

    expect(await screen.findByText('foo bar empty')).toBeInTheDocument();
  });

  it('should display the given data', async () => {
    const testData = [
      {
        id: 1,
        state: 'open',
        draft: false,
        repositoryUrl:
          'https://api.github.com/repos/RoadieHQ/roadie-backstage-plugins',
        pullRequest: {
          htmlUrl: 'pull_request_url',
        },
        title: 'Test PR listed 1',
        number: 1,
        user: {
          login: 'TestUser',
          htmlUrl: 'user_html_url',
        },
        comments: 0,
        htmlUrl: 'repo_url',
      },
    ];
    render(
      <TestApiProvider apis={apis}>
        <PullRequestsListView data={testData} emptyStateText="" />
      </TestApiProvider>,
    );

    expect(await screen.findByText('Test PR listed 1')).toBeInTheDocument();
    expect(
      await screen.findByText('RoadieHQ/roadie-backstage-plugins'),
    ).toBeInTheDocument();
    expect(await screen.findByText('#1 opened by')).toBeInTheDocument();
    expect(await screen.findByText('TestUser')).toBeInTheDocument();
  });
});
