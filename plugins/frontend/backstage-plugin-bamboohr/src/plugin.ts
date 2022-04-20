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

import { createPlugin, createRouteRef } from '@backstage/core-plugin-api';

import { homePlugin, createCardExtension } from '@backstage/plugin-home';

export const rootRouteRef = createRouteRef({
  id: 'bamboohr',
});

export const bamboohrPlugin = createPlugin({
  id: 'bamboohr',
  routes: {
    entityContent: rootRouteRef,
  },
});

export const HomePageBambooHrWhosOut = homePlugin.provide(
  createCardExtension<{
    start_time?: string;
    end_time?: string;
  }>({
    name: 'HomePageBambooHrWhosOut',
    title: "BambooHR Who's out",
    components: () => import('./components/WhosOutContent'),
  }),
);
