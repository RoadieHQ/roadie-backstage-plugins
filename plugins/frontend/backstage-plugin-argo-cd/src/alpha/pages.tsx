import React from 'react'; // Add this line to import React

import { PageBlueprint } from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { entityContentRouteRef } from '../plugin';

/**
 * @alpha
 */
export const argoCdPage = PageBlueprint.make({
  name: 'ArgoCdPage',
  params: {
    defaultPath: '/',
    // you can reuse the existing routeRef
    // by wrapping into the convertLegacyRouteRef.
    routeRef: convertLegacyRouteRef(entityContentRouteRef),
    // these inputs usually match the props required by the component.
    loader: () => import('../Router').then(m => compatWrapper(<m.Router />)),
  },
});
