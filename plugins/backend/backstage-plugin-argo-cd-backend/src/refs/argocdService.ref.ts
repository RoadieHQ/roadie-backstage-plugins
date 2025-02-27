import { createServiceRef } from '@backstage/backend-plugin-api';
import { ArgoServiceApi } from '../service/types';

export const argocdServiceRef = createServiceRef<ArgoServiceApi>({
  id: 'argocd-service-backend',
});
