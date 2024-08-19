import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { createEntityContentExtension } from '@backstage/plugin-catalog-react/alpha';
import { entityContentRouteRef } from '../plugin';
import React from 'react';

/**
 * @alpha
 */
export const entityDatadogContent = createEntityContentExtension({
  defaultPath: '/datadog',
  defaultTitle: 'Datadog',
  name: 'entity',
  routeRef: convertLegacyRouteRef(entityContentRouteRef),
  loader: () => import('../Router').then(m => compatWrapper(<m.Router />)),
});
