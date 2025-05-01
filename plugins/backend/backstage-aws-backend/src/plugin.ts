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
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ config, http, logger }) {
        logger.info('AWSBackendPlugin is initializing');
        http.use(
          await createRouter({
            config,
            logger,
          }),
        );
      },
    });
  },
});
