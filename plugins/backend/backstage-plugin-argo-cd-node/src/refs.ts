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

import { createServiceRef } from '@backstage/backend-plugin-api';
import { ArgoServiceApi } from './types';

/**
 * A service reference for the ArgoCD service, intended to be consumed by
 * other backend plugins that need to interact with ArgoCD.
 *
 * The concrete implementation is provided by
 * `@roadiehq/backstage-plugin-argo-cd-backend`. Ensure that plugin is
 * registered in your backend and its `argocdServiceFactory` is added
 * before declaring a dependency on this ref.
 *
 * @public
 */
export const argocdServiceRef = createServiceRef<ArgoServiceApi>({
  id: 'argocd-service-backend',
  scope: 'plugin',
});
