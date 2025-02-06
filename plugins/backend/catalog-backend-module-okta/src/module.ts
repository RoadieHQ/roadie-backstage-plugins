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
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import {
  EntityProviderFactory,
  oktaCatalogBackendEntityProviderFactoryExtensionPoint,
  oktaCatalogBackendUserTransformerExtensionPoint,
} from './extensions';
import { OktaUserEntityTransformer } from './providers/types';
import { userEntityFromOktaUser } from './providers/userEntityFromOktaUser';
import { readSchedulerServiceTaskScheduleDefinitionFromConfig } from '@backstage/backend-plugin-api';

export const oktaCatalogBackendModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'okta-entity-provider',
  register(env) {
    let entityFactory: EntityProviderFactory | null = null;
    env.registerExtensionPoint(
      oktaCatalogBackendEntityProviderFactoryExtensionPoint,
      {
        setEntityProviderFactory(factory: EntityProviderFactory) {
          if (entityFactory) {
            throw new Error('Entity factory can only be set once');
          }
          entityFactory = factory;
        },
      },
    );

    let userTransformer: OktaUserEntityTransformer | null = null;
    env.registerExtensionPoint(
      oktaCatalogBackendUserTransformerExtensionPoint,
      {
        setUserTransformer(transformer: OktaUserEntityTransformer) {
          if (userTransformer) {
            throw new Error('UserTransformer can only be set once');
          }
          userTransformer = transformer;
        },
      },
    );

    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, config, scheduler }) {
        if (!entityFactory) {
          throw new Error('No entity factory has been provided');
        }
        userTransformer ??= userEntityFromOktaUser;

        const oktaConfigs =
          config.getOptionalConfigArray('catalog.providers.okta') ?? [];
        for (const oktaConfig of oktaConfigs) {
          const provider = entityFactory(oktaConfig);
          catalog.addEntityProvider(provider);
          const schedule = readSchedulerServiceTaskScheduleDefinitionFromConfig(
            oktaConfig.getConfig('schedule'),
          );
          await scheduler.scheduleTask({
            id: `okta-entity-provider-${provider.getProviderName()}`,
            fn: async () => {
              await provider.run();
            },
            ...schedule,
          });
        }
      },
    });
  },
});
