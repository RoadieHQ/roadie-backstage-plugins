import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { entityContentRouteRef } from '../plugin';
import { DATADOG_ANNOTATION_DASHBOARD_URL } from '../components/useDatadogAppData';

/**
 * @alpha
 */
export const entityDatadogContent = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    path: '/datadog',
    title: 'Datadog',
    filter: {
      [`metadata.annotations.${DATADOG_ANNOTATION_DASHBOARD_URL}`]: {
        $exists: true,
      },
    },
    routeRef: convertLegacyRouteRef(entityContentRouteRef),
    loader: () => import('../Router').then(m => compatWrapper(<m.Router />)),
  },
});
