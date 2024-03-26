import { ArgoServiceApi } from './service/types';
import { ArgoService } from './service/argocd.service';
import {
  coreServices,
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';

export const argoCdServiceRef = createServiceRef<ArgoServiceApi>({
  id: 'argocd.service',
  scope: 'plugin',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      factory({ logger, config }) {
        return new ArgoService('', '', config, logger);
      },
    }),
});
