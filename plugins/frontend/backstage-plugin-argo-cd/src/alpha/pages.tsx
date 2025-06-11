import React from 'react'; // Add this line to import React

import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { entityContentRouteRef } from '../plugin';

/**
 * @alpha
 */
export const argoCdPage = EntityContentBlueprint.make({
  name: 'ArgoCdPage',
  params: {
    defaultPath: '/argocd',
    defaultTitle: 'ArgoCD',
    // you can reuse the existing routeRef
    // by wrapping into the convertLegacyRouteRef.
    routeRef: convertLegacyRouteRef(entityContentRouteRef),
    // these inputs usually match the props required by the component.
    loader: () => import('../Router').then(m => compatWrapper(<m.Router />)),
  },
});
