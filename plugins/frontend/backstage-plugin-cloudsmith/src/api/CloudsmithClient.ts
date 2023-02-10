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
  CloudsmithApi,
  RepoStats,
  RepoAuditLog,
  RepoVulnerability,
  CloudsmithUsage,
} from './CloudsmithApi';
import { FetchApi, DiscoveryApi } from '@backstage/core-plugin-api';

type Options = {
  fetchApi: FetchApi;
  discoveryApi: DiscoveryApi;
};

export class CloudsmithClient implements CloudsmithApi {
  private readonly fetchApi: FetchApi;
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.fetchApi = options.fetchApi;
    this.discoveryApi = options.discoveryApi;
  }

  // create async getApiUrl function to cache the Cloudsmith API URL and create a cache object
  private async getApiUrl(): Promise<string> {
    const cache = new Map();
    if (cache.has('apiUrl')) {
      return cache.get('apiUrl');
    }
    const apiUrl = `${await this.discoveryApi.getBaseUrl('proxy')}/cloudsmith`;
    cache.set('apiUrl', apiUrl);
    return apiUrl;
  }

  // get data from Cloudsmith metrics endpoint (https://help.cloudsmith.io/reference/metrics_packages_list)
  async getRepoMetrics({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepoStats> {
    const cloudsmithApiUrl = await this.getApiUrl();
    const response = await this.fetchApi.fetch(
      `${cloudsmithApiUrl}/metrics/packages/${owner}/${repo}/`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to retrieve package metrics: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  // get data from Cloudsmith quota endpoint (https://help.cloudsmith.io/reference/quota_read)
  async getQuota({ owner }: { owner: string }): Promise<CloudsmithUsage> {
    const cloudsmithApiUrl = await this.getApiUrl();
    const response = await this.fetchApi.fetch(
      `${cloudsmithApiUrl}/quota/${owner}/`,
    );
    if (!response.ok) {
      throw new Error(`Failed to retrieve quota: ${response.statusText}`);
    } else {
      if (response.status === 402) {
        window.location.href = 'https://cloudsmith.com/product/pricing/';
        throw new Error(`Payment Required: ${response.statusText}`);
      }
    }
    return await response.json();
  }

  // get repository audit logs from Cloudsmith audit repo logs endpoint (https://help.cloudsmith.io/reference/audit_log_repo_list) and support pagniation
  async getRepoAuditLogs({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepoAuditLog> {
    const cloudsmithApiUrl = await this.getApiUrl();
    const response = await this.fetchApi.fetch(
      `${cloudsmithApiUrl}/audit-log/${owner}/${repo}/?page_size=100`,
    );
    if (!response.ok) {
      throw new Error(`Failed to retrieve audit logs: ${response.statusText}`);
    }
    return await response.json();
  }

  // get repository security scan logs for a Cloudsmith repository endpoint (https://help.cloudsmith.io/reference/vulnerabilities_repo_list)
  async getRepoSecurityScanLogs({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepoVulnerability> {
    const cloudsmithApiUrl = await this.getApiUrl();
    const response = await this.fetchApi.fetch(
      `${cloudsmithApiUrl}/vulnerabilities/${owner}/${repo}/?page_size=100`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to retrieve security scan logs: ${response.statusText}`,
      );
    }
    return await response.json();
  }
}
