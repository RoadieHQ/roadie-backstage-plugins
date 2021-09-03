import {
  configApiRef,
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
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, configApi }) =>
        new ArgoCDApiClient({
          discoveryApi: discoveryApi,
          backendBaseUrl: configApi.getString('backend.baseUrl'),
          perCluster: configApi.getBoolean('argo.perCluster.enabled'),
        }),
    }),
  ],
  routes: {
    entityContent: entityContentRouteRef,
  },
});

export const EntityArgoCDContent = argocdPlugin.provide(
  createRoutableExtension({
    component: () => import('./Router').then(m => m.Router),
    mountPoint: entityContentRouteRef,
  }),
);

export const EntityArgoCDOverviewCard = argocdPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/ArgoCDDetailsCard').then(m => m.ArgoCDDetailsCard),
    },
  }),
);

export const EntityArgoCDHistoryCard = argocdPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/ArgoCDHistoryCard').then(m => m.ArgoCDHistoryCard),
    },
  }),
);
