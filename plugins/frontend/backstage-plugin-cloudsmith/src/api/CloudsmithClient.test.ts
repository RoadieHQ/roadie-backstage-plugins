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

import { CloudsmithClient } from './CloudsmithClient';
import { FetchApi } from '@backstage/core-plugin-api';

const mockResponse = {
  packages: {
    active: 20,
    inactive: 180,
    total: 200,
  },
};

describe('CloudsmithClient', () => {
  let client: CloudsmithClient;

  beforeEach(() => {
    client = new CloudsmithClient({
      discoveryApi: {
        getBaseUrl: pluginId =>
          Promise.resolve(`https://backstage/api/${pluginId}`),
      },
      fetchApi: {
        fetch: async (url: string) => {
          if (
            url ===
            'https://backstage/api/proxy/cloudsmith/metrics/packages/name/repo-name/'
          ) {
            return {
              ok: true,
              json: async () => mockResponse,
            };
          }
          return {
            ok: false,
            statusText: 'Not Found',
          };
        },
      } as any as FetchApi,
    });
  });

  it('is an instance', () => {
    expect(client).not.toEqual(undefined);
  });

  describe('#getRepoMetrics', () => {
    it('returns the repo metrics', async () => {
      expect(
        await client.getRepoMetrics({ owner: 'name', repo: 'repo-name' }),
      ).toEqual(mockResponse);
    });

    it('throws error if the metrics are not found', async () => {
      await expect(
        client.getRepoMetrics({ owner: 'name', repo: 'not-a-repo-name' }),
      ).rejects.toEqual(
        new Error('Failed to retrieve package metrics: Not Found'),
      );
    });
  });
});
