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

import { render } from '@testing-library/react';
import {
  AnyApiRef,
  discoveryApiRef,
  FetchApi,
  fetchApiRef,
  errorApiRef,
} from '@backstage/core-plugin-api';
import {
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { Content } from './Content';
import { repoVulnerabilityResponse } from '../../api/mocks/mocks';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { mockApis } from '@backstage/test-utils';

const apis: [AnyApiRef, Partial<unknown>][] = [
  [errorApiRef, {}],
  [
    discoveryApiRef,
    {
      getBaseUrl: (pluginId: string) =>
        Promise.resolve(`https://backstage/api/${pluginId}`),
    },
  ],
  [
    fetchApiRef,
    {
      fetch: async (url: string) => {
        if (
          new URL(url).pathname ===
          '/api/proxy/cloudsmith/vulnerabilities/name/repo-name/'
        ) {
          return {
            ok: true,
            json: async () => repoVulnerabilityResponse,
          };
        }
        return {
          ok: false,
          statusText: 'Not Found',
        };
      },
    } as any as FetchApi,
  ],
  [translationApiRef, mockApis.translation()]
];

describe('Content', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  it('should display an overview card with the data from the requests', async () => {
    const rendered = render(
      <TestApiProvider apis={apis}>
        <Content owner="name" repo="repo-name" />
      </TestApiProvider>,
    );
    expect(
      await rendered.findByText('Vulnerabilities found in repo-name'),
    ).toBeInTheDocument();
  });
});
