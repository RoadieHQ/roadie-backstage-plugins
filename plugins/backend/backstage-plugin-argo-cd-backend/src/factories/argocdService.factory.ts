import { createServiceFactory } from '@backstage/backend-plugin-api';
import { argocdServiceRef } from '../refs/argocdService.ref';
import { ArgoService } from '../service/argocd.service';
import { coreServices } from '@backstage/backend-plugin-api';

export const argocdServiceFactory = createServiceFactory({
  service: argocdServiceRef,
  deps: {
    config: coreServices.rootConfig,
    logger: coreServices.logger,
  },
  async factory({ config, logger }) {
    const argoUserName =
      config.getOptionalString('argocd.username') ?? 'argocdUsername';
    const argoPassword =
      config.getOptionalString('argocd.password') ?? 'argocdPassword';
    return new ArgoService(argoUserName, argoPassword, config, logger);
  },
});
