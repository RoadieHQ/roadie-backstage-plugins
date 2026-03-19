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
  createRoutableExtension,
  createRouteRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { Entity } from '@backstage/catalog-model';
import difference from 'lodash/difference';
import {
  LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION,
  LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
  LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
} from './constants';

export const entityContentRouteRef = createRouteRef({
  id: 'launch-darkly-project',
});

export const launchdarklyPlugin = createPlugin({
  id: 'launchdarkly',
  routes: {
    root: rootRouteRef,
    entityContent: entityContentRouteRef,
  },
});

export const EntityLaunchdarklyContextOverviewCard = launchdarklyPlugin.provide(
  createComponentExtension({
    name: 'EntityLaunchdarklyContextOverviewCard',
    component: {
      lazy: () =>
        import('./components/EntityLaunchdarklyContextOverviewCard').then(
          m => m.EntityLaunchdarklyContextOverviewCard,
        ),
    },
  }),
);

export const EntityLaunchdarklyCard = launchdarklyPlugin.provide(
  createComponentExtension({
    name: 'EntityLaunchdarklyCard',
    component: {
      lazy: () =>
        import('./components/EntityLaunchdarklyCard').then(
          m => m.EntityLaunchdarklyCard,
        ),
    },
  }),
);

export const EntityLaunchdarklyProjectOverviewContent =
  launchdarklyPlugin.provide(
    createRoutableExtension({
      name: 'EntityLaunchdarklyProjectOverviewContent',
      component: () =>
        import('./components/EntityLaunchdarklyProjectOverviewContent').then(
          m => m.EntityLaunchdarklyProjectOverviewContent,
        ),
      mountPoint: entityContentRouteRef,
    }),
  );

export const isLaunchdarklyContextAvailable = (entity: Entity) => {
  const diff = difference(
    [LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION],
    Object.keys(entity.metadata?.annotations || {}),
  );
  return diff.length === 0;
};

export const isLaunchdarklyProjectAvailable = (entity: Entity) => {
  const diff = difference(
    [
      LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
      LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
    ],
    Object.keys(entity.metadata?.annotations || {}),
  );
  return diff.length === 0;
};

/**
 * @deprecated use isLaunchdarklyContextAvailable instead
 */
export const isLaunchdarklyAvailable = isLaunchdarklyContextAvailable;
/**
 * @deprecated use EntityLaunchdarklyContextOverviewCard instead
 */
export const EntityLaunchdarklyOverviewCard =
  EntityLaunchdarklyContextOverviewCard;
