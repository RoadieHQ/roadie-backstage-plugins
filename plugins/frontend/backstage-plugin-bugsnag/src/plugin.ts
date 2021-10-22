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
  createRoutableExtension,
  createApiFactory,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { BugsnagClient } from '.';
import { rootRouteRef } from './routes';
import { bugsnagApiRef } from './api/BugsnagApi';

export const backstagePluginBugsnag = createPlugin({
  id: 'bugsnag',
  apis: [
    createApiFactory({
      api: bugsnagApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new BugsnagClient({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const EntityBugsnagErrorsOverviewTable = backstagePluginBugsnag.provide(
  createRoutableExtension({
    name: 'EntityBugsnagErrorsOverviewTable',
    component: () =>
      import('./components/ErrorsOverviewComponent').then(m => m.ErrorsOverview),
    mountPoint: rootRouteRef,
  }),
);
