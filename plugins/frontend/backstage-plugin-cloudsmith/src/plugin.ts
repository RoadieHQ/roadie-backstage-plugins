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
  createApiFactory,
  createPlugin,
  FetchApi,
  fetchApiRef,
  DiscoveryApi,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { createCardExtension } from '@backstage/plugin-home';

import { CloudsmithClient, cloudsmithApiRef } from './api';

export const cloudsmithPlugin = createPlugin({
  id: 'cloudsmith',
  apis: [
    createApiFactory({
      api: cloudsmithApiRef,
      deps: { fetchApi: fetchApiRef, discoveryApi: discoveryApiRef },
      factory: ({
        fetchApi,
        discoveryApi,
      }: {
        fetchApi: FetchApi;
        discoveryApi: DiscoveryApi;
      }) => {
        return new CloudsmithClient({
          fetchApi,
          discoveryApi,
        });
      },
    }),
  ],
});

export const CloudsmithStatsCard = cloudsmithPlugin.provide(
  createCardExtension<{ owner: string; repo: string }>({
    name: 'CloudsmithStatsCard',
    title: '',
    components: () => import('./components/CloudsmithStatsCard'),
  }),
);

export const CloudsmithQuotaCard = cloudsmithPlugin.provide(
  createCardExtension<{ owner: string }>({
    name: 'CloudsmithQuotaCard',
    title: '',
    components: () => import('./components/CloudsmithQuotaCard'),
  }),
);

export const CloudsmithRepositoryAuditLogCard = cloudsmithPlugin.provide(
  createCardExtension<{ owner: string; repo: string }>({
    name: 'CloudsmithRepositoryAuditLogCard',
    title: '',
    components: () => import('./components/CloudsmithRepositoryAuditLogCard'),
  }),
);

export const CloudsmithRepositorySecurityCard = cloudsmithPlugin.provide(
  createCardExtension<{ owner: string; repo: string }>({
    name: 'CloudsmithRepositorySecurityCard',
    title: '',
    components: () => import('./components/CloudsmithRepositorySecurityCard'),
  }),
);
