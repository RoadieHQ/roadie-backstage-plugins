/*
 * Copyright 2024 Larder Software Limited
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
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { wizApiRef, WizClient } from './api';

export const backstagePluginWizPlugin = createPlugin({
  id: 'wiz',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: wizApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new WizClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const EntityWizIssues = backstagePluginWizPlugin.provide(
  createRoutableExtension({
    name: 'EntityWizIssues',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

export const EntityIssuesWidget = backstagePluginWizPlugin.provide(
  createComponentExtension({
    name: 'EntityIssuesWidget',
    component: {
      lazy: () =>
        import('./components/IssuesWidget').then(m => m.EntityIssuesWidget),
    },
  }),
);

export const EntityIssuesChart = backstagePluginWizPlugin.provide(
  createComponentExtension({
    name: 'EntityIssuesChart',
    component: {
      lazy: () =>
        import('./components/EntityIssuesChart').then(m => m.EntityIssuesChart),
    },
  }),
);

export const EntitySeverityChart = backstagePluginWizPlugin.provide(
  createComponentExtension({
    name: 'EntitySeverityChart',
    component: {
      lazy: () =>
        import('./components/EntitySeverityChart').then(
          m => m.EntitySeverityChart,
        ),
    },
  }),
);
