import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { entityContentRouteRef, isDatadogDashboardAvailable } from '../plugin';

/**
 * @alpha
 */
export const entityDatadogContent = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    defaultPath: '/datadog',
    defaultTitle: 'Datadog',
    filter: isDatadogDashboardAvailable,
    routeRef: convertLegacyRouteRef(entityContentRouteRef),
    loader: () => import('../Router').then(m => compatWrapper(<m.Router />)),
  },
});
