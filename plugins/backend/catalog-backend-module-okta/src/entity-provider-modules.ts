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
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  EntityProviderFactory,
  oktaCatalogBackendEntityProviderFactoryExtensionPoint,
} from './extensions';
import { Config } from '@backstage/config';
import {
  OktaGroupEntityProvider,
  OktaOrgEntityProvider,
  OktaUserEntityProvider,
} from './providers';

export const oktaOrgEntityProviderModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'default-okta-org-entity-provider',
  register(env) {
    env.registerInit({
      deps: {
        provider: oktaCatalogBackendEntityProviderFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ provider, logger }) {
        const factory: EntityProviderFactory = (oktaConfig: Config) =>
          OktaOrgEntityProvider.fromConfig(oktaConfig, {
            logger: logger,
            userNamingStrategy: 'strip-domain-email',
            groupNamingStrategy: 'kebab-case-name',
          });

        provider.setEntityProviderFactory(factory);
      },
    });
  },
});

export const oktaUserEntityProviderModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'default-okta-user-entity-provider',
  register(env) {
    env.registerInit({
      deps: {
        provider: oktaCatalogBackendEntityProviderFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ provider, logger }) {
        const factory: EntityProviderFactory = (oktaConfig: Config) =>
          OktaUserEntityProvider.fromConfig(oktaConfig, {
            logger: logger,
            namingStrategy: 'strip-domain-email',
          });

        provider.setEntityProviderFactory(factory);
      },
    });
  },
});

export const oktaGroupEntityProviderModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'default-okta-group-entity-provider',
  register(env) {
    env.registerInit({
      deps: {
        provider: oktaCatalogBackendEntityProviderFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ provider, logger }) {
        const factory: EntityProviderFactory = (oktaConfig: Config) =>
          OktaGroupEntityProvider.fromConfig(oktaConfig, {
            logger: logger,
            userNamingStrategy: 'strip-domain-email',
            namingStrategy: 'kebab-case-name',
          });

        provider.setEntityProviderFactory(factory);
      },
    });
  },
});
