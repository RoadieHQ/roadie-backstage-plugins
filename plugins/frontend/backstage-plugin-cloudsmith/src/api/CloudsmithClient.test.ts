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
import {
  repoAuditLogsResponse,
  repoMetricResponse,
  repoVulnerabilityResponse,
  quotaResponse,
  packagesListResponse,
  packageVulnerabilityDetailsResponse as packageVulnerabilityResponse,
  packageScanResultsResponse,
} from './mocks/mocks';

describe('CloudsmithClient', () => {
  let client: CloudsmithClient;
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    client = new CloudsmithClient({
      discoveryApi: {
        getBaseUrl: jest.fn().mockResolvedValue('https://backstage/api/proxy'),
      },
      fetchApi: {
        fetch: mockFetch,
      } as unknown as FetchApi,
    });
  });

  it('is an instance', () => {
    expect(client).toBeInstanceOf(CloudsmithClient);
  });

  const testCases = [
    {
      method: 'getRepoMetrics',
      path: '/cloudsmith/metrics/packages/name/repo-name/',
      params: { owner: 'name', repo: 'repo-name' },
      response: repoMetricResponse,
    },
    {
      method: 'getRepoAuditLogs',
      path: '/cloudsmith/audit-log/name/repo-name/?page_size=100',
      params: { owner: 'name', repo: 'repo-name' },
      response: repoAuditLogsResponse,
    },
    {
      method: 'getRepoSecurityScanLogs',
      path: '/cloudsmith/vulnerabilities/name/repo-name/?page_size=100',
      params: { owner: 'name', repo: 'repo-name' },
      response: repoVulnerabilityResponse,
    },
    {
      method: 'getQuota',
      path: '/cloudsmith/quota/name/',
      params: { owner: 'name' },
      response: quotaResponse,
    },
    {
      method: 'getPackagesList',
      path: '/cloudsmith/packages/name/repo-name/?page=1&page_size=500',
      params: { owner: 'name', repo: 'repo-name', page: 1, pageSize: 500 },
      response: packagesListResponse.packages,
    },
    {
      method: 'getPackageVulnerabilities',
      path: '/cloudsmith/vulnerabilities/name/repo-name/package-id/',
      params: {
        owner: 'name',
        repo: 'repo-name',
        packageIdentifier: 'package-id',
      },
      response: packageVulnerabilityResponse,
    },
    {
      method: 'getPackageScanResults',
      path: '/cloudsmith/vulnerabilities/name/repo-name/package-id/scan-id/',
      params: {
        owner: 'name',
        repo: 'repo-name',
        packageIdentifier: 'package-id',
        scanResultIdentifier: 'scan-id',
      },
      response: packageScanResultsResponse,
    },
  ];

  testCases.forEach(({ method, path, params, response }) => {
    describe(`#${method}`, () => {
      it(`returns the ${method.replace('get', '').toLowerCase()}`, async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => response,
          headers: new Headers(),
        });

        // @ts-ignore
        const result = await client[method](params);
        expect(mockFetch).toHaveBeenCalledWith(
          `https://backstage/api/proxy${path}`,
          expect.any(Object),
        );
        expect(result).toEqual(
          method === 'getPackagesList'
            ? {
                packages: response,
                pagination: {
                  count: Array.isArray(response) ? response.length : 0,
                },
              }
            : response,
        );
      });

      it(`throws error if the ${method
        .replace('get', '')
        .toLowerCase()} are not found`, async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          statusText: 'Not Found',
        });

        // @ts-ignore
        await expect(client[method](params)).rejects.toThrow(
          `Cloudsmith API request failed: Not Found`,
        );
      });
    });
  });

  describe('#getQuota', () => {
    it('returns the quota', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => quotaResponse,
        headers: new Headers(),
      });

      const result = await client.getQuota({ owner: 'name' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://backstage/api/proxy/cloudsmith/quota/name/',
        expect.any(Object),
      );
      expect(result).toEqual(quotaResponse);
    });

    it('throws error if the quota is not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(client.getQuota({ owner: 'name' })).rejects.toThrow(
        'Cloudsmith API request failed: Not Found',
      );
    });
  });
});
