import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { Logger } from 'winston';

export const ArgoCDPlugin = createBackendPlugin({
  pluginId: 'argocd',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ http, logger, config }) {
        logger.info('ArgoCD plugin is initializing');
        http.use(
          await createRouter({
            logger: logger as Logger,
            config,
          }),
        );
      },
    });
  },
});
