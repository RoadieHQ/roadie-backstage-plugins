import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

export const AWSBackendPlugin = createBackendPlugin({
  pluginId: 'aws',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ http, logger, config }) {
        logger.info('AWSBackendPlugin is initializing');
        http.use(
          await createRouter({
            logger,
            config,
          }),
        );
      },
    });
  },
});
