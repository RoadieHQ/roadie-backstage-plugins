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
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { shortcutApiRef, ShortcutClient } from './api';

import { rootRouteRef } from './routes';

export const backstagePluginShortcutPlugin = createPlugin({
  id: 'backstage-plugin-shortcut',
  apis: [
    createApiFactory({
      api: shortcutApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new ShortcutClient({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const EntityShorcutPageContent = backstagePluginShortcutPlugin.provide(
  createRoutableExtension({
    name: 'EntityShorcutPageContent',
    component: () =>
      import('./components/Page/ShortcutPage').then(m => m.ShortcutPage),
    mountPoint: rootRouteRef,
  }),
);

export const EntityShortcutStoriesCard = backstagePluginShortcutPlugin.provide(
  createComponentExtension({
    name: 'EntityShortcutStoriesCard',
    component: {
      lazy: () => import('./components/Widgets/index').then(m => m.StoriesCard),
    },
  }),
);
