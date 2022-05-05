/*
 * Copyright 2021 Larder Software Limited
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
  createPlugin,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  createRouteRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { buildKiteApiRef, BuildkiteApi } from './api';

export const rootRouteRef = createRouteRef({
  id: 'buildkite',
});

import { createSubRouteRef } from '@backstage/core-plugin-api';

export const buildKiteBuildRouteRef = createSubRouteRef({
  id: 'buildkite/build',
  path: '/builds/:buildNumber',
  parent: rootRouteRef,
});

export const buildkitePlugin = createPlugin({
  id: 'buildkite',
  apis: [
    createApiFactory({
      api: buildKiteApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new BuildkiteApi({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

export const EntityBuildkiteContent = buildkitePlugin.provide(
  createRoutableExtension({
    name: 'EntityBuildkiteContent',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
