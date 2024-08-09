import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { ArgoCDBuilder } from './service/ArgoCdBuilder';

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
        const builder: ArgoCDBuilder = ArgoCDBuilder.createBuilder({
          logger,
          config,
        });
        const { router } = await builder.build();
        http.use(router);
      },
    });
  },
});
