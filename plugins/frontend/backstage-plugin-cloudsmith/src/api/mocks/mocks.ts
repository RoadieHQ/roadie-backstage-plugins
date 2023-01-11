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
    actor: 'aspeed',
    actor_ip_address: '111.111.111.111',
    actor_kind: 'user',
    actor_location: {
      city: 'XXXX',
      continent: 'XXXX',
      country: 'XXXX',
      country_code: 'XXXX',
      latitude: '1',
      longitude: '-1',
      postal_code: 'XXXX',
    },
    actor_slug_perm: 'XXXXXXX',
    actor_url: 'https://api.cloudsmith.io/v1/users/profile/foo/',
    context: '',
    event: 'create.entitlement_created',
    event_at: '2022-12-07T16:19:46.246956Z',
    object: 'f113f13f13',
    object_kind: 'repository_token',
    object_slug_perm: '3f1f13f31f',
    uuid: 'feqfeqfeq',
  },
];

export const repoVulnerabilityResponse = [
  {
    identifier: 'XkBX1JBveOzyzqb0',
    created_at: '2022-12-06T10:39:43.505180Z',
    package: {
      identifier: 'dNZbXot2ZLHX',
      name: 'rhel7-ubi-minimal',
      version:
        'e2ccab8d1b005db223ed6a319a1631f2a9db8225396129d77bc2f8b2c31d21ca',
      url: 'https://api.cloudsmith.io/v1/packages/cloudsmith-test/bartosz-testing/dNZbXot2ZLHX/',
    },
    scan_id: 1,
    has_vulnerabilities: true,
    num_vulnerabilities: 470,
    max_severity: 'High',
  },
];

export const quotaResponse = {
  usage: {
    raw: {
      bandwidth: {
        used: 45,
        configured: 100,
        plan_limit: 100,
        percentage_used: 4.5,
      },
      storage: {
        used: 60,
        configured: 100,
        plan_limit: 100,
        percentage_used: 6,
      },
    },
    display: {
      bandwidth: {
        used: '175.7 KB',
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
