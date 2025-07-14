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

import {
  AnyApiRef,
  ProfileInfo,
  identityApiRef,
  errorApiRef,
  IdentityApi,
  discoveryApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import {
  wrapInTestApp,
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import { render, screen, cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from '../../mocks/handlers';
import { Content } from './StoriesCardHomepage';

const errorApiMock = { post: jest.fn(), error$: jest.fn() };

const mockProfileInfo: Partial<ProfileInfo> = {
  displayName: 'Test user',
  email: 'test@user.com',
};

const mockProfileInfoGuest: Partial<ProfileInfo> = {
  displayName: 'Guest',
  email: 'guest@user.com',
};

const identityApi: Partial<IdentityApi> = {
  getBackstageIdentity: jest.fn(),
  getCredentials: async () => ({ token: undefined }),
  getProfileInfo: async () => mockProfileInfo,
};

const identityApiGuest: Partial<IdentityApi> = {
  getBackstageIdentity: jest.fn(),
  getCredentials: async () => ({ token: undefined }),
  getProfileInfo: async () => mockProfileInfoGuest,
};

const mockConfigBase = {
  getBaseUrl: async (_: string[]) => 'http://exampleapi.com',
};

const config = {
  getOptionalConfigArray: (_: string) => [
    { getOptionalString: (_s: string) => undefined },
  ],
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [errorApiRef, errorApiMock],
  [configApiRef, config],
  [discoveryApiRef, mockConfigBase],
  [identityApiRef, identityApi],
];

const apisGuest: [AnyApiRef, Partial<unknown>][] = [
  [errorApiRef, errorApiMock],
  [configApiRef, config],
  [discoveryApiRef, mockConfigBase],
  [identityApiRef, identityApiGuest],
];

describe('Shortcut stories card', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    worker.use(...handlers);
  });

  it('should render home card with logged user stories', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content />
        </TestApiProvider>,
      ),
      {},
    );

    expect(
      await screen.findByText('CTA button not working', {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it('should find only non-completed stories', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content />
        </TestApiProvider>,
      ),
      {},
    );

    expect(
      await screen.findAllByText('CTA button', {
        exact: false,
      }),
    ).toHaveLength(2);
  });

  it('should not render the stories', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={apisGuest}>
          <Content />
        </TestApiProvider>,
      ),
      {},
    );

    expect(
      await screen.findByText(
        'Please double check you are using the same email for Backstage and Shortcut profiles',
        {
          exact: false,
        },
      ),
    ).toBeInTheDocument();
  });
});
