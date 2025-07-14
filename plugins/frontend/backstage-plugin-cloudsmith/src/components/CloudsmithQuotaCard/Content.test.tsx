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

import { AnyApiRef, discoveryApiRef, FetchApi, fetchApiRef, errorApiRef } from '@backstage/core-plugin-api';
import {
  renderInTestApp,
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { Content } from './Content';
import { quotaResponse } from '../../api/mocks/mocks';

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
        if (url === 'https://backstage/api/proxy/cloudsmith/quota/name/') {
          return {
            ok: true,
            json: async () => quotaResponse,
          };
        }
        return {
          ok: false,
          statusText: 'Not Found',
        };
      },
    } as any as FetchApi,
  ],
];

describe('Content', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  it('should display an ovreview card with the data from the requests', async () => {
    const rendered = renderInTestApp(
      <TestApiProvider apis={apis}>
        <Content owner="name" />
      </TestApiProvider>,
    );
    expect(
      await (await rendered).findByText('Cloudsmith Quota'),
    ).toBeInTheDocument();
  });
});
