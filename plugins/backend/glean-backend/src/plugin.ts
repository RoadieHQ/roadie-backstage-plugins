/*
 * Copyright 2025 Larder Software Limited
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
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { GleanIndexClient } from './client/GleanIndexClient';
import { readScheduleConfigOptions } from './config';
import { TechDocsClient } from './client/TechDocsClient';
import { CatalogClient } from '@backstage/catalog-client';

/**
 * glean-backend plugin
 *
 * @public
 */
export const gleanPlugin = createBackendPlugin({
  pluginId: 'glean',
  register(env) {
    env.registerInit({
      deps: {
        auth: coreServices.auth,
        config: coreServices.rootConfig,
        discoveryApi: coreServices.discovery,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ auth, config, discoveryApi, logger, scheduler }) {
        const catalogApi = new CatalogClient({ discoveryApi });
        await scheduler.scheduleTask({
          ...readScheduleConfigOptions(config),
          id: 'glean-backend-batch-index',
          fn: async () => {
            await GleanIndexClient.create({
              auth,
              catalogApi,
              config,
              discoveryApi,
              logger,
            }).batchIndex(
              await TechDocsClient.create({
                auth,
                catalogApi,
                config,
                discoveryApi,
                logger,
              }).getTechDocsEntities(),
            );
          },
        });
      },
    });
  },
});
