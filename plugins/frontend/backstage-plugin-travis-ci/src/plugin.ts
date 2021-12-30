import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { TravisCIApiClient, travisCIApiRef } from './api';

export const entityContentRouteRef = createRouteRef({
  id: 'travisCI',
});

export const travisciPlugin = createPlugin({
  id: 'travisci',
  apis: [
    createApiFactory({
      api: travisCIApiRef,
      deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef },
      factory: ({ discoveryApi, identityApi }) =>
        new TravisCIApiClient({ discoveryApi, identityApi }),
    }),
  ],
  routes: {
    entityContent: entityContentRouteRef,
  },
});

export const EntityTravisCIContent = travisciPlugin.provide(
  createRoutableExtension({
    name: 'EntityTravisCIContent',
    component: () => import('./Router').then(m => m.Router),
    mountPoint: entityContentRouteRef,
  }),
);

export const EntityTravisCIOverviewCard = travisciPlugin.provide(
  createComponentExtension({
    name: 'EntityTravisCIOverviewCard',
    component: {
      lazy: () =>
        import('./components/LastBuildCard').then(m => m.LastBuildCard),
    },
  }),
);
