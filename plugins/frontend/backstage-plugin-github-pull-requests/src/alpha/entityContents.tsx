import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { entityContentRouteRef } from '../plugin';

/**
 * @alpha
 */
export const githubPullRequestsEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/github-pull-requests',
    title: 'GitHub Pull Requests',
    routeRef: convertLegacyRouteRef(entityContentRouteRef),
    async loader() {
      const { Router } = await import('../components/Router');
      return compatWrapper(<Router />);
    },
  },
});
