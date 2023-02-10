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

export type BandwithStat = {
  value: number;
  units: string;
  display: string;
};

export type DownloadStat = {
  value: number;
};

export type RepoStats = {
  packages: {
    active: number;
    inactive: number;
    total: number;
    bandwidth: {
      lowest: BandwithStat;
      average: BandwithStat;
      highest: BandwithStat;
      total: BandwithStat;
    };
    downloads: {
      lowest: DownloadStat;
      average: DownloadStat;
      highest: DownloadStat;
      total: DownloadStat;
    };
  };
};

export type CloudsmithUsage = {
  usage: {
    raw: {
      bandwidth: {
        used: number;
        configured: number;
        plan_limit: number;
        percentage_used: number;
      };
      storage: {
        used: number;
        configured: number;
        plan_limit: number;
        percentage_used: number;
      };
    };
    display: {
      bandwidth: {
        used: string;
        configured: string;
        plan_limit: string;
        percentage_used: string;
      };
      storage: {
        used: string;
        configured: string;
        plan_limit: string;
        percentage_used: string;
      };
    };
  };
};

export type RepoVulnerability = [
  {
    [x: string]: any;
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
  },
];

export type RepoAuditLog = [
  {
    [x: string]: any;
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
  },
];

export type CloudsmithApi = {
  getRepoMetrics: (options: {
    owner: string;
    repo: string;
  }) => Promise<RepoStats>;

  getQuota: (options: { owner: string }) => Promise<CloudsmithUsage>;

  getRepoAuditLogs: (options: {
    owner: string;
    repo: string;
  }) => Promise<RepoAuditLog>;

  getRepoSecurityScanLogs: (options: {
    owner: string;
    repo: string;
  }) => Promise<RepoVulnerability>;
};
