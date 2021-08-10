/*
 * Copyright 2020 RoadieHQ
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
  createRouteRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { buildKiteApiRef, BuildkiteApi } from './api';

export const entityContentRouteRef = createRouteRef({
  title: 'Buildkite Entity Content',
});

export const buildViewRouteRef = createRouteRef({
  title: 'Buildkite Build view',
  path: ':buildNumber',
});

export const buildkitePlugin = createPlugin({
  id: 'buildkite',
  apis: [
    createApiFactory({
      api: buildKiteApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new BuildkiteApi({ discoveryApi }),
    }),
  ],
  routes: {
    entityContent: entityContentRouteRef,
    buildView: buildViewRouteRef,
  },
});

export const EntityBuildkiteContent = buildkitePlugin.provide(
  createRoutableExtension({
    component: () => import('./components/Router').then((m) => m.Router),
    mountPoint: entityContentRouteRef,
  })
);
