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
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { PrometheusApi, prometheusApiRef } from './api';

export const rootRouteRef = createRouteRef({
  id: 'backstage-plugin-prometheus',
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

export const EntityPrometheusContent = backstagePluginPrometheusPlugin.provide(
  createRoutableExtension({
    name: 'EntityPrometheusContent',
    component: () =>
      import('./components/PrometheusContentWrapper').then(m => m.default),
    mountPoint: rootRouteRef,
  }),
);

export const EntityPrometheusAlertCard = backstagePluginPrometheusPlugin.provide(
  createComponentExtension({
    name: 'EntityPrometheusAlertCard',
    component: {
      lazy: () =>
        import('./components/PrometheusAlertStatus').then(
          m => m.PrometheusAlertEntityWrapper,
        ),
    },
  }),
);

export const EntityPrometheusGraphCard = backstagePluginPrometheusPlugin.provide(
  createComponentExtension({
    name: 'EntityPrometheusGraphCard',
    component: {
      lazy: () =>
        import('./components/PrometheusGraph').then(
          m => m.PrometheusGraphEntityWrapper,
        ),
    },
  }),
);
