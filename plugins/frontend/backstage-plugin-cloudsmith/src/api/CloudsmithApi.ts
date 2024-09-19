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

import { createApiRef } from '@backstage/core-plugin-api';

export const cloudsmithApiRef = createApiRef<CloudsmithApi>({
  id: 'plugin.cloudsmith.service',
});

// Common types
export type Stat = {
  value: number;
  units?: string;
  display?: string;
};

export type Usage = {
  used: number;
  configured: number;
  plan_limit: number;
  percentage_used: number;
};

export type DisplayUsage = {
  used: string;
  configured: string;
  plan_limit: string;
  percentage_used: string;
};

// API response types
export type RepoStats = {
  packages: {
    active: number;
    inactive: number;
    total: number;
    bandwidth: {
      lowest: Stat;
      average: Stat;
      highest: Stat;
      total: Stat;
    };
    downloads: {
      lowest: Stat;
      average: Stat;
      highest: Stat;
      total: Stat;
    };
  };
};

export type CloudsmithUsage = {
  usage: {
    display: {
      bandwidth: {
        configured: string;
        percentage_used: string;
        plan_limit: string;
        used: string;
      };
      storage: {
        configured: string;
        peak: string;
        percentage_used: string;
        plan_limit: string;
        used: string;
      };
    };
    raw: {
      bandwidth: {
        configured: number;
        percentage_used: string;
        plan_limit: number;
        used: number;
      };
      storage: {
        configured: number;
        peak: number;
        percentage_used: string;
        plan_limit: number;
        used: number;
      };
    };
  };
};

export type RepoVulnerability = Array<{
  identifier: string;
  created_at: string;
  package: {
    identifier: string;
    name: string;
    version: string;
    url: string;
  };
  scan_id: number;
  has_vulnerabilities: boolean;
  num_vulnerabilities: number;
  max_severity: string;
  [key: string]: any;
}>;

export type RepoAuditLog = Array<{
  actor: string;
  actor_ip_address: string;
  actor_kind: string;
  actor_location: {
    city: string;
    continent: string;
    country: string;
    country_code: string;
    latitude: string;
    longitude: string;
    postal_code: string;
  };
  actor_slug_perm: string;
  actor_url: string;
  context: string;
  event: string;
  event_at: string;
  object: string;
  object_kind: string;
  object_slug_perm: string;
  uuid: string;
}>;

export interface CloudsmithApi {
  getAuditLog(owner: string, repository: string): Promise<RepoAuditLog>;
  getRepoMetrics(options: { owner: string; repo: string }): Promise<RepoStats>;
  getQuota(options: { owner: string }): Promise<CloudsmithUsage>;
  getRepoAuditLogs(options: {
    owner: string;
    repo: string;
    query?: string;
  }): Promise<RepoAuditLog>;
  getRepoSecurityScanLogs(options: {
    owner: string;
    repo: string;
  }): Promise<RepoVulnerability>;
  getPackageVulnerabilities(options: {
    owner: string;
    repo: string;
    packageIdentifier: string;
  }): Promise<RepoVulnerability>;
  getPackageVulnerabilityDetails(options: {
    owner: string;
    repo: string;
    identifier: string;
  }): Promise<RepoVulnerability>;
  getPackageScanResults(options: {
    owner: string;
    repo: string;
    packageIdentifier: string;
    scanResultIdentifier: string;
  }): Promise<PackageScanResults>;
  getPackagesList(options: {
    owner: string;
    repo: string;
    query?: string;
    sort?: string;
    page: number;
    pageSize: number;
  }): Promise<PackagesList>;
}

export type PackageScanResults = {
  created_at: string;
  has_vulnerabilities: boolean;
  identifier: string;
  max_severity: string;
  num_vulnerabilities: number;
  package: {
    identifier: string;
    name: string;
    url: string;
    version: string;
  };
  scan: {
    results: Array<{
      affected_version: {
        major: number;
        minor: number;
        operator: string;
        patch: number;
        raw_version: string;
        version: string;
      };
      description: string;
      fixed_version: {
        major: number;
        minor: number;
        operator: string;
        patch: number;
        raw_version: string;
        version: string;
      };
      package_name: string;
      references: string[];
      severity: string;
      severity_source: string;
      title: string;
      vulnerability_id: string;
    }>;
    target: string;
    type: string;
  };
  scan_id: number;
};

export type Package = {
  name: string;
  version: string;
  format: string;
  created_at: string;
  url: string;
  status: number;
  status_str: string;
  tags: Record<string, string[]>;
  cdn_url: string;
  uploaded_at: string;
  size?: number;
  uploader?: string;
  security_scan_status?: string;
  security_scan_status_updated_at?: string;
  stage_str?: string;
  stage_updated_at?: string;
  description?: string;
  files?: Array<{
    filename: string;
    size: number;
    downloads: number;
    cdn_url: string;
  }>;
  self_html_url?: string;
  license?: string;
};

export type PaginationInfo = {
  count: number;
};

export type PackagesList = {
  packages: Package[];
  pagination: {
    count: number;
  };
};

import { CloudsmithApi as CloudsmithApiInterface } from './CloudsmithApi';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export class CloudsmithClient implements CloudsmithApiInterface {
  private readonly fetchApi: FetchApi;
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { fetchApi: FetchApi; discoveryApi: DiscoveryApi }) {
    this.fetchApi = options.fetchApi;
    this.discoveryApi = options.discoveryApi;
  }

  private async getApiUrl(): Promise<string> {
    return `${await this.discoveryApi.getBaseUrl('proxy')}/cloudsmith`;
  }

  private async fetchCloudsmithApi<T>(path: string): Promise<T> {
    const apiUrl = await this.getApiUrl();
    const response = await this.fetchApi.fetch(`${apiUrl}${path}`);

    if (!response.ok) {
      throw new Error(`Cloudsmith API request failed: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getAuditLog(owner: string, repository: string): Promise<RepoAuditLog> {
    return this.fetchCloudsmithApi(`/${owner}/${repository}/audit-log/`);
  }

  async getRepoMetrics(options: {
    owner: string;
    repo: string;
  }): Promise<RepoStats> {
    return this.fetchCloudsmithApi(`/${options.owner}/${options.repo}/stats/`);
  }

  async getQuota(options: { owner: string }): Promise<CloudsmithUsage> {
    return this.fetchCloudsmithApi(`/${options.owner}/quota/`);
  }

  async getRepoAuditLogs(options: {
    owner: string;
    repo: string;
    query?: string;
  }): Promise<RepoAuditLog> {
    const queryParams = options.query
      ? `?query=${encodeURIComponent(options.query)}`
      : '';
    return this.fetchCloudsmithApi(
      `/${options.owner}/${options.repo}/audit-log/${queryParams}`,
    );
  }

  async getRepoSecurityScanLogs(options: {
    owner: string;
    repo: string;
  }): Promise<RepoVulnerability> {
    return this.fetchCloudsmithApi(
      `/${options.owner}/${options.repo}/security-scan-logs/`,
    );
  }

  async getPackageVulnerabilities(options: {
    owner: string;
    repo: string;
    packageIdentifier: string;
  }): Promise<RepoVulnerability> {
    return this.fetchCloudsmithApi(
      `/${options.owner}/${options.repo}/packages/${options.packageIdentifier}/vulnerabilities/`,
    );
  }

  async getPackageVulnerabilityDetails(options: {
    owner: string;
    repo: string;
    identifier: string;
  }): Promise<RepoVulnerability> {
    return this.fetchCloudsmithApi(
      `/${options.owner}/${options.repo}/vulnerabilities/${options.identifier}/`,
    );
  }

  async getPackageScanResults(options: {
    owner: string;
    repo: string;
    packageIdentifier: string;
    scanResultIdentifier: string;
  }): Promise<PackageScanResults> {
    return this.fetchCloudsmithApi(
      `/${options.owner}/${options.repo}/packages/${options.packageIdentifier}/scan-results/${options.scanResultIdentifier}/`,
    );
  }

  async getPackagesList(options: {
    owner: string;
    repo: string;
    query?: string;
    sort?: string;
    page: number;
    pageSize: number;
  }): Promise<PackagesList> {
    const queryParams = new URLSearchParams({
      page: options.page.toString(),
      page_size: options.pageSize.toString(),
      ...(options.query && { query: options.query }),
      ...(options.sort && { sort: options.sort }),
    });
    return this.fetchCloudsmithApi(
      `/${options.owner}/${options.repo}/packages/?${queryParams}`,
    );
  }
}
