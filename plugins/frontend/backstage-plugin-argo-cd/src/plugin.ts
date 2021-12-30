import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { ArgoCDApiClient, argoCDApiRef } from './api';

export const entityContentRouteRef = createRouteRef({
  id: 'ArgoCD Entity Content',
});

export const argocdPlugin = createPlugin({
  id: 'argocd',
  apis: [
    createApiFactory({
      api: argoCDApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, identityApi, configApi }) =>
        new ArgoCDApiClient({
          discoveryApi,
          identityApi,
          backendBaseUrl: configApi.getString('backend.baseUrl'),
          searchInstances: Boolean(
            configApi.getOptionalConfigArray('argocd.appLocatorMethods')
              ?.length,
          ),
        }),
    }),
  ],
  routes: {
    entityContent: entityContentRouteRef,
  },
});

export const EntityArgoCDContent = argocdPlugin.provide(
  createRoutableExtension({
    name: 'EntityArgoCDContent',
    component: () => import('./Router').then(m => m.Router),
    mountPoint: entityContentRouteRef,
  }),
);

export const EntityArgoCDOverviewCard = argocdPlugin.provide(
  createComponentExtension({
    name: 'EntityArgoCDOverviewCard',
    component: {
      lazy: () =>
        import('./components/ArgoCDDetailsCard').then(m => m.ArgoCDDetailsCard),
    },
  }),
);

export const EntityArgoCDHistoryCard = argocdPlugin.provide(
  createComponentExtension({
    name: 'EntityArgoCDHistoryCard',
    component: {
      lazy: () =>
        import('./components/ArgoCDHistoryCard').then(m => m.ArgoCDHistoryCard),
    },
  }),
);
