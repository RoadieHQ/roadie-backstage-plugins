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

import { setupWorker } from 'msw';
import ReactDOM from 'react-dom/client';

import { createApp } from '@backstage/frontend-defaults';
import appPlugin from '@backstage/plugin-app';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { scmAuthApiRef } from '@backstage/integration-react';

import { handlers } from '../src/mocks/handlers';
import githubPullRequestsPlugin from '../src/alpha';
import { scmAuthApi } from './scmAuthApi';
import { catalogApi } from './catalogApi';

// Intercepts and mocks the GitHub API
const worker = setupWorker();
worker.use(...handlers);
await worker.start();

const appPluginOverrides = appPlugin.withOverrides({
  extensions: [
    appPlugin.getExtension('api:app/scm-auth').override({
      params: defineParams =>
        defineParams({
          api: scmAuthApiRef,
          deps: {},
          factory() {
            return scmAuthApi;
          },
        }),
    }),
  ],
});

const catalogPluginOverrides = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('api:catalog').override({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApi,
        }),
    }),
  ],
});

const app = createApp({
  features: [
    appPluginOverrides,
    catalogPluginOverrides,
    githubPullRequestsPlugin,
  ],
});

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
