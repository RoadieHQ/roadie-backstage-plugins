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
  createComponentExtension,
  createPlugin,
  createRouteRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { homePlugin, createCardExtension } from '@backstage/plugin-home';

export const rootRouteRef = createRouteRef({
  id: 'iframe',
});

export const iframePlugin = createPlugin({
  id: 'iframe',
  routes: {
    entityContent: rootRouteRef,
  },
});

export const EntityIFrameCard = iframePlugin.provide(
  createComponentExtension({
    name: 'EntityIFrameCard',
    component: {
      lazy: () =>
        import('./components/IFrameComponent').then(
          m => m.IFrameCard,
        ),
    },
  }),
);

export const EntityIFrameContent = iframePlugin.provide(
  createRoutableExtension({
    name: 'EntityIFrameContent',
    component: () =>
      import('./components/IFrameContent').then(m => m.IFrameContent),
    mountPoint: rootRouteRef,
  }),
);

export const HomePageIFrameCard = homePlugin.provide(
  createCardExtension<{
    src: string;
    height?: string;
    width?: string;
    class?: string;
  }>({
    name: 'HomePageIFrameCard',
    title: "IFrame Card",
    components: () => import('./components/HomePageCard'),
  }),
);


