/*
 * Copyright 2026 Larder Software Limited
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
  coreServices,
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import { ArgoServiceApi } from './types';
import { ArgoService } from './service/argocd.service';

/**
 * A service reference for the ArgoCD service, intended to be consumed by
 * other backend plugins that need to interact with ArgoCD.
 *
 * A default factory is provided inline, so no manual wiring is required.
 * Install `@roadiehq/backstage-plugin-argo-cd-node` and declare a dependency
 * on this ref — the ArgoService will be created automatically from config.
 *
 * @public
 */
export const argocdServiceRef = createServiceRef<ArgoServiceApi>({
  id: 'argocd-service-backend',
  scope: 'plugin',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      factory: deps => ArgoService.fromConfig(deps),
    }),
});

/**
 * Standalone factory for the ArgoCD service. Use this if you need to register
 * the factory explicitly (e.g. to override the default implementation).
 *
 * @public
 */
// eslint-disable-next-line @backstage/no-undeclared-imports
export const argocdServiceFactory = createServiceFactory({
  service: argocdServiceRef,
  deps: {
    config: coreServices.rootConfig,
    logger: coreServices.logger,
  },
  factory: deps => ArgoService.fromConfig(deps),
});
