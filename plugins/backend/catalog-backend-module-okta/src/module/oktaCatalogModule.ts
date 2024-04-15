/*
 * Copyright 2023 Larder Software Limited
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
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { OktaOrgEntityProvider } from '../providers';
import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  OktaGroupEntityTransformer,
  OktaUserEntityTransformer,
} from '../providers/types';

/**
 * Interface for {@link oktaOrgEntityProviderTransformExtensionPoint}.
 *
 * @alpha
 */
export interface OktaOrgEntityProviderTransformsExtensionPoint {
  /**
   * Set the function that transforms a user entry in okta to an entity.
   * Optionally, you can pass separate transformers per provider ID.
   */
  setUserTransformer(transformer: OktaUserEntityTransformer): void;

  /**
   * Set the function that transforms a group entry in okta to an entity.
   * Optionally, you can pass separate transformers per provider ID.
   */
  setGroupTransformer(transformer: OktaGroupEntityTransformer): void;
}

/**
 * Extension point used to customize the transforms used by the module.
 *
 * @alpha
 */
export const oktaOrgEntityProviderTransformExtensionPoint =
  createExtensionPoint<OktaOrgEntityProviderTransformsExtensionPoint>({
    id: 'catalog.oktaOrgEntityProvider.transforms',
  });

/**
 * Registers the `OktaOrgEntityProvider` with the catalog processing extension point.
 *
 * @alpha
 */
export const oktaCatalogModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'okta',
  register(env) {
    let userTransformer: OktaUserEntityTransformer | undefined;
    let groupTransformer: OktaGroupEntityTransformer | undefined;
    env.registerExtensionPoint(oktaOrgEntityProviderTransformExtensionPoint, {
      setUserTransformer(transformer) {
        if (userTransformer) {
          throw new Error('User transformer may only be set once');
        }
        userTransformer = transformer;
      },
      setGroupTransformer(transformer) {
        if (groupTransformer) {
          throw new Error('Group transformer may only be set once');
        }
        groupTransformer = transformer;
      },
    });
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, config, logger, scheduler }) {
        catalog.addEntityProvider(
          OktaOrgEntityProvider.fromConfig(config, {
            logger: loggerToWinstonLogger(logger),
            userNamingStrategy: 'strip-domain-email',
            groupNamingStrategy: 'kebab-case-name',
            userTransformer: userTransformer,
            groupTransformer: groupTransformer,
            scheduler,
          }),
        );
      },
    });
  },
});
