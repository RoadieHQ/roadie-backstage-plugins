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
import {
  IdentityApi,
  errorApiRef,
  configApiRef,
  AnyApiRef,
} from '@backstage/core-plugin-api';
import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { rest } from 'msw';
import {
  setupRequestMockHandlers,
  wrapInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { TravisCIApiClient, travisCIApiRef } from '../api';
import { RecentTravisCIBuildsWidget } from '..';
import { buildsResponseMock, entityMock } from '../mocks/mocks';
import { EntityProvider } from '@backstage/plugin-catalog-react';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const errorApiMock = { post: jest.fn(), error$: jest.fn() };
const identityApi: IdentityApi = {
  async getProfileInfo() {
    return { email: 'jane-fonda@spotify.com' };
  },
  async getBackstageIdentity() {
    return {
      type: 'user',
      userEntityRef: 'user:default/jane-fonda',
      ownershipEntityRefs: [],
    };
  },
  async getCredentials() {
    return { token: 'fake-id-token' };
  },
  async signOut() {
    return Promise.resolve();
  },
};

const config = {
  getString: (_: string) => undefined,
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [configApiRef, config],
  [errorApiRef, errorApiMock],
  [travisCIApiRef, new TravisCIApiClient({ discoveryApi, identityApi })],
];
describe('LastBuildCard', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => {
    // jest.resetAllMocks();
    worker.use(
      rest.get(
        'http://exampleapi.com/travisci/api/repo/RoadieHQ%2Fsample-service/builds',
        (_, res, ctx) => res(ctx.json(buildsResponseMock)),
      ),
      rest.get(
        'http://exampleapi.com/travisci/api/repo/RoadieHQ%2Fsample-service/builds',
        (_, res, ctx) => res(ctx.json(buildsResponseMock)),
      ),
    );
  });

  it('should display widget with data', async () => {
    const rendered = render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <RecentTravisCIBuildsWidget entity={entityMock} />
          </EntityProvider>
        </TestApiProvider>,
      ),
    );
    expect(
      await rendered.findByText(buildsResponseMock.builds[2].commit.message),
    ).toBeInTheDocument();
    expect(
      (await rendered.findAllByText(buildsResponseMock.builds[2].state))[0],
    ).toBeInTheDocument();
    expect(
      (
        await rendered.findAllByText(buildsResponseMock.builds[2].branch.name)
      )[0],
    ).toBeInTheDocument();
  });
});
