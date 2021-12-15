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

import { useApi } from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import { Entity, parseLocationReference } from '@backstage/catalog-model';

const defaultGithubIntegration = {
  hostname: 'github.com',
  baseUrl: 'https://api.github.com',
};

export const useEntityGithubScmIntegration = (entity: Entity) => {
  const integrations = useApi(scmIntegrationsApiRef);
  if (!entity) {
    return defaultGithubIntegration;
  }
  const location = parseLocationReference(
    entity.metadata.annotations!!['backstage.io/managed-by-location'] || '',
  );
  const scm = integrations.github.byUrl(location.target);
  if (scm) {
    return {
      hostname: scm.config.host,
      baseUrl: scm.config.apiBaseUrl,
    };
  }
  return defaultGithubIntegration;
};
