import {
  coreServices,
  createBackendPlugin,
  createServiceFactory,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { argocdServiceRef } from './refs/argocdService.ref';
import { ArgoService } from './service/argocd.service';

export const ArgoCDPlugin = createBackendPlugin({
  pluginId: 'argocd',
  register(env) {
    // Register the concrete ArgoService implementation for argocdServiceRef
    // so that any plugin depending on the ref gets this factory.
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

/**
 * Factory that provides the ArgoService implementation for argocdServiceRef.
 * Exported so it can be registered independently if needed.
 *
 * @public
 */
export const argocdServiceFactory = createServiceFactory({
  service: argocdServiceRef,
  deps: {
    config: coreServices.rootConfig,
    logger: coreServices.logger,
  },
  factory: deps => ArgoService.fromConfig(deps),
});
