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
} from './mocks/mocks';

// Create tests to test the CloudsmithClient.ts file

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
            new URL(url).pathname ===
            '/api/proxy/cloudsmith/metrics/packages/name/repo-name/'
          ) {
            return {
              ok: true,
              json: async () => repoMetricResponse,
            };
          }
          if (
            new URL(url).pathname ===
            '/api/proxy/cloudsmith/audit-log/name/repo-name/'
          ) {
            return {
              ok: true,
              json: async () => repoAuditLogsResponse,
            };
          }
          if (
            new URL(url).pathname ===
            '/api/proxy/cloudsmith/vulnerabilities/name/repo-name/'
          ) {
            return {
              ok: true,
              json: async () => repoVulnerabilityResponse,
            };
          }
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
    });
  });

  it('is an instance', () => {
    expect(client).not.toEqual(undefined);
  });

  describe('#getRepoMetrics', () => {
    it('returns the repo metrics', async () => {
      expect(
        await client.getRepoMetrics({ owner: 'name', repo: 'repo-name' }),
      ).toEqual(repoMetricResponse);
    });

    it('throws error if the metrics are not found', async () => {
      await expect(
        client.getRepoMetrics({ owner: 'name', repo: 'not-a-repo-name' }),
      ).rejects.toEqual(
        new Error('Failed to retrieve package metrics: Not Found'),
      );
    });
  });

  describe('#getRepoAuditLogs', () => {
    it('returns the repo audit logs', async () => {
      expect(
        await client.getRepoAuditLogs({ owner: 'name', repo: 'repo-name' }),
      ).toEqual(repoAuditLogsResponse);
    });

    it('throws error if the audit logs are not found', async () => {
      await expect(
        client.getRepoAuditLogs({ owner: 'name', repo: 'not-a-repo-name' }),
      ).rejects.toEqual(new Error('Failed to retrieve audit logs: Not Found'));
    });
  });

  describe('#getRepoVulnerabilities', () => {
    it('returns the repo vulnerabilities', async () => {
      expect(
        await client.getRepoSecurityScanLogs({
          owner: 'name',
          repo: 'repo-name',
        }),
      ).toEqual(repoVulnerabilityResponse);
    });

    it('throws error if the vulnerabilities are not found', async () => {
      await expect(
        client.getRepoSecurityScanLogs({
          owner: 'name',
          repo: 'not-a-repo-name',
        }),
      ).rejects.toEqual(
        new Error('Failed to retrieve security scan logs: Not Found'),
      );
    });
  });

  describe('#getQuota', () => {
    it('returns the quota', async () => {
      expect(await client.getQuota({ owner: 'name' })).toEqual(quotaResponse);
    });

    it('throws error if the quota is not found', async () => {
      await expect(client.getQuota({ owner: 'not-a-name' })).rejects.toEqual(
        new Error('Failed to retrieve quota: Not Found'),
      );
    });
  });
});
