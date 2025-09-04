import {
  coreServices,
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import { ArgoService } from '../service/argocd.service';
import { ArgoServiceApi } from '../service/types';

export const argocdServiceRef = createServiceRef<ArgoServiceApi>({
  id: 'argocd-service-backend',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async factory({ config, logger }) {
      const argoUserName = config.getOptionalString('argocd.username');
      const argoPassword = config.getOptionalString('argocd.password');
      return new ArgoService(argoUserName, argoPassword, config, logger);
      },
    }),
});
