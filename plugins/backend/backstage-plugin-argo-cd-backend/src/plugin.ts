import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { argocdServiceRef } from './refs/argocdService.ref';

export const ArgoCDPlugin = createBackendPlugin({
  pluginId: 'argocd',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        argocdService: argocdServiceRef,
      },
      async init({ http, logger, config, argocdService }) {
        logger.info('ArgoCD plugin is initializing');
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
