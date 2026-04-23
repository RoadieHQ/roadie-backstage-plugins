import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { ArgoService } from './service/argocd.service';

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
        const argocdService = ArgoService.fromConfig({ config, logger });
        http.use(
          await createRouter({
            logger,
            config,
            argocdService,
          }),
        );
      },
    });
  },
});
