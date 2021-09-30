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
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { PrometheusApi, prometheusApiRef } from './api';

export const rootRouteRef = createRouteRef({
  title: 'backstage-plugin-prometheus',
});

export const entityContentRouteRef = createRouteRef({
  title: 'Buildkite Entity Content',
});

export const buildViewRouteRef = createRouteRef({
  title: 'Buildkite Build view',
  path: ':buildNumber',
});

export const backstagePluginPrometheusPlugin = createPlugin({
  id: 'backstage-plugin-prometheus',
  apis: [
    createApiFactory({
      api: prometheusApiRef,
      deps: { discoveryApi: discoveryApiRef, configApi: configApiRef },
      factory: ({ discoveryApi, configApi }) =>
        new PrometheusApi({ discoveryApi, configApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const BackstagePrometheusContent = backstagePluginPrometheusPlugin.provide(
  createRoutableExtension({
    component: () =>
      import('./components/PrometheusContentWrapper').then(m => m.default),
    mountPoint: rootRouteRef,
  }),
);
