import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { entityContentRouteRef } from '../plugin';
import React from 'react';

/**
 * @alpha
 */
export const entityDatadogContent = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    defaultPath: '/datadog',
    defaultTitle: 'Datadog',
    filter: 'kind:component,resource',
    routeRef: convertLegacyRouteRef(entityContentRouteRef),
    loader: () => import('../Router').then(m => compatWrapper(<m.Router />)),
  },
});
