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
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { Entity } from '@backstage/catalog-model';
import difference from 'lodash/difference';
import {
  LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION,
  LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
  LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
} from './constants';

export const launchdarklyPlugin = createPlugin({
  id: 'launchdarkly',
  routes: {
    root: rootRouteRef,
  },
});

export const EntityLaunchdarklyOverviewCard = launchdarklyPlugin.provide(
  createComponentExtension({
    name: 'EntityLaunchdarklyOverviewCard',
    component: {
      lazy: () =>
        import('./components/EntityLaunchdarklyOverviewCard').then(
          m => m.EntityLaunchdarklyOverviewCard,
        ),
    },
  }),
);

export const isLaunchdarklyAvailable = (entity: Entity) => {
  const diff = difference(
    [
      LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
      LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION,
      LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
    ],
    Object.keys(entity.metadata?.annotations || {}),
  );
  return diff.length === 0;
};
