import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { ArgoCDApiClient, argoCDApiRef } from './api';

export const entityContentRouteRef = createRouteRef({
  title: 'ArgoCD Entity Content',
});

export const argocdPlugin = createPlugin({
  id: 'argocd',
  apis: [
    createApiFactory({
      api: argoCDApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new ArgoCDApiClient({ discoveryApi }),
    }),
  ],
  routes: {
    entityContent: entityContentRouteRef,
  },
});

export const EntityArgoCDContent = argocdPlugin.provide(
  createRoutableExtension({
    component: () => import('./Router').then((m) => m.Router),
    mountPoint: entityContentRouteRef,
  })
);

export const EntityArgoCDOverviewCard = argocdPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/ArgoCDDetailsCard').then(
          (m) => m.ArgoCDDetailsCard
        ),
    },
  })
);

export const EntityArgoCDHistoryCard = argocdPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/ArgoCDHistoryCard').then(
          (m) => m.ArgoCDHistoryCard
        ),
    },
  })
);
