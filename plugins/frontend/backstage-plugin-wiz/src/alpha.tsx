/*
 * Copyright 2025 Larder Software Limited
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
  ApiBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { wizApiRef, WizClient } from './api';
import { isWizAvailable } from './components/Router';
import { rootRouteRef } from './routes';

const wizApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: wizApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new WizClient({ discoveryApi, fetchApi }),
    }),
});

const wizEntityContent = EntityContentBlueprint.make({
  name: 'issues',
  params: {
    path: '/wiz',
    title: 'Wiz',
    filter: isWizAvailable,
    loader: () =>
      import('./components/Router').then(m => compatWrapper(<m.Router />)),
  },
});

const wizIssuesWidgetCard = EntityCardBlueprint.make({
  name: 'issues-widget',
  params: {
    filter: isWizAvailable,
    loader: () =>
      import('./components/IssuesWidget').then(m =>
        compatWrapper(<m.EntityIssuesWidget />),
      ),
  },
});

const wizIssuesChartCard = EntityCardBlueprint.make({
  name: 'issues-chart',
  params: {
    filter: isWizAvailable,
    loader: () =>
      import('./components/EntityIssuesChart').then(m =>
        compatWrapper(<m.EntityIssuesChart />),
      ),
  },
});

const wizSeverityChartCard = EntityCardBlueprint.make({
  name: 'severity-chart',
  params: {
    filter: isWizAvailable,
    loader: () =>
      import('./components/EntitySeverityChart').then(m =>
        compatWrapper(<m.EntitySeverityChart />),
      ),
  },
});

export default createFrontendPlugin({
  pluginId: 'wiz',
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
  extensions: [
    wizApi,
    wizEntityContent,
    wizIssuesWidgetCard,
    wizIssuesChartCard,
    wizSeverityChartCard,
  ],
});
