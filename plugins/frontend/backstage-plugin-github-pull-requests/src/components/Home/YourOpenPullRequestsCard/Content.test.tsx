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
import { AnyApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';
import {
  wrapInTestApp,
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import { render, screen, cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { Content } from './Content';
import { handlers } from '../../../mocks/handlers';
import {
  SignedInMockGithubAuthState,
  SignedOutMockGithubAuthState,
} from '../../../mocks/githubAuthApi';

const apis: [AnyApiRef, Partial<unknown>][] = [
  [githubAuthApiRef, SignedInMockGithubAuthState],
];
describe('<YourOpenPullRequestCard>', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);
  afterEach(() => {
    worker.resetHandlers();
    cleanup();
  });
  beforeEach(() => {
    worker.use(...handlers);
  });
  it('should render sign in page', async () => {
    const api: [AnyApiRef, Partial<unknown>][] = [
      [githubAuthApiRef, SignedOutMockGithubAuthState],
    ];
    render(
      wrapInTestApp(
        <TestApiProvider apis={api}>
          <Content />
        </TestApiProvider>,
      ),
      {},
    );

    expect(
      await screen.findByText('You are not logged into github.', {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
  it('should render home card with requested reviews', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content />
        </TestApiProvider>,
      ),
      {},
    );

    expect(
      await screen.findByText('add github homepage PR components', {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
});
