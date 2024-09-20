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
  PackagesList,
  Package,
  PackageScanResults,
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

  private async getApiUrl(): Promise<string> {
    return `${await this.discoveryApi.getBaseUrl('proxy')}/cloudsmith`;
  }

  private async fetchCloudsmithApi<T>(
    path: string,
  ): Promise<{ data: T; headers: Headers }> {
    const apiUrl = await this.getApiUrl();
    const response = await this.fetchApi.fetch(`${apiUrl}${path}`, {
      headers: {
        Accept: 'application/json',
        // Add the X-Api-Key header if needed
        // 'X-Api-Key': 'YOUR_API_KEY_HERE',
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudsmith API request failed: ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    return { data, headers: response.headers };
  }

  async getRepoMetrics({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepoStats> {
    const { data } = await this.fetchCloudsmithApi<RepoStats>(
      `/metrics/packages/${owner}/${repo}/`,
    );
    return data;
  }

  async getQuota({ owner }: { owner: string }): Promise<CloudsmithUsage> {
    try {
      const { data } = await this.fetchCloudsmithApi<CloudsmithUsage>(
        `/quota/${owner}/`,
      );
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('402')) {
        window.location.href = 'https://cloudsmith.com/product/pricing/';
        throw new Error('Payment Required');
      }
      throw error;
    }
  }

  async getRepoAuditLogs({
    owner,
    repo,
    query,
  }: {
    owner: string;
    repo: string;
    query?: string;
  }): Promise<RepoAuditLog> {
    const params = new URLSearchParams({
      page_size: '100',
    });
    if (query) {
      params.append('query', query);
    }
    const { data } = await this.fetchCloudsmithApi<RepoAuditLog>(
      `/audit-log/${owner}/${repo}/?${params}`,
    );
    return data;
  }

  async getRepoSecurityScanLogs({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepoVulnerability> {
    const { data } = await this.fetchCloudsmithApi<RepoVulnerability>(
      `/vulnerabilities/${owner}/${repo}/?page_size=100`,
    );
    return data;
  }

  async getPackageVulnerabilities({
    owner,
    repo,
    packageIdentifier,
  }: {
    owner: string;
    repo: string;
    packageIdentifier: string;
  }): Promise<RepoVulnerability> {
    const { data } = await this.fetchCloudsmithApi<RepoVulnerability>(
      `/vulnerabilities/${owner}/${repo}/${packageIdentifier}/`,
    );
    return data;
  }

  async getPackageVulnerabilityDetails({
    owner,
    repo,
    identifier,
  }: {
    owner: string;
    repo: string;
    identifier: string;
  }): Promise<RepoVulnerability> {
    const { data } = await this.fetchCloudsmithApi<RepoVulnerability>(
      `/vulnerabilities/${owner}/${repo}/${identifier}/`,
    );
    return data;
  }

  async getPackageScanResults({
    owner,
    repo,
    packageIdentifier,
    scanResultIdentifier,
  }: {
    owner: string;
    repo: string;
    packageIdentifier: string;
    scanResultIdentifier: string;
  }): Promise<PackageScanResults> {
    const { data } = await this.fetchCloudsmithApi<PackageScanResults>(
      `/vulnerabilities/${owner}/${repo}/${packageIdentifier}/${scanResultIdentifier}/`,
    );
    return data;
  }

  async getPackagesList({
    owner,
    repo,
    query,
    sort,
  }: {
    owner: string;
    repo: string;
    query?: string;
    sort?: string;
    page: number;
    pageSize: number;
  }): Promise<PackagesList> {
    const params = new URLSearchParams({
      page: '1',
      page_size: '500',
    });
    if (query) {
      params.append('query', query);
    }
    if (sort) {
      params.append('sort', sort);
    }

    const { data } = await this.fetchCloudsmithApi<Package[]>(
      `/packages/${owner}/${repo}/?${params}`,
    );

    return {
      packages: data,
      pagination: {
        count: data.length,
      },
    };
  }

  async getAuditLog(owner: string, repository: string): Promise<RepoAuditLog> {
    return this.getRepoAuditLogs({ owner, repo: repository });
  }
}
