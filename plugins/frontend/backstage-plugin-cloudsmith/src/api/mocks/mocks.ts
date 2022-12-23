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
export const repoMetricResponse = {
  packages: {
    active: 52,
    inactive: 23,
    total: 75,
  },
};

export const repoAuditLogsResponse = [
  {
    actor: 'bartosz-blizniak-TGv',
    event: 'create.repository_gpg_key_created',
    event_at: '2022-11-14T11:03:15.369843Z',
    object: 'BLckzgMRKqU5',
    object_kind: 'repository_gpg_key',
    object_slug_perm: 'BLckzgMRKqU5',
  },
];

export const repoVulnerabilityResponse = [
  {
    identifier: 'XkBX1JBveOzyzqb0',
    created_at: '2022-12-06T10:39:43.505180Z',
    package: {
      name: 'rhel7-ubi-minimal',
      version:
        'e2ccab8d1b005db223ed6a319a1631f2a9db8225396129d77bc2f8b2c31d21ca',
      url: 'https://api.cloudsmith.io/v1/packages/cloudsmith-test/bartosz-testing/dNZbXot2ZLHX/',
    },
    has_vulnerabilities: true,
    max_severity: 'High',
  },
];

export const quotaResponse = {
  usage: {
    display: {
      bandwidth: {
        used: '59.8 KB',
        configured: '3.9 TB',
        plan_limit: '2 TB',
        percentage_used: '0.0%',
      },
      storage: {
        used: '25.3 GB',
        configured: '2.0 TB',
        plan_limit: '1 TB',
        percentage_used: '1.265%',
      },
    },
  },
};
