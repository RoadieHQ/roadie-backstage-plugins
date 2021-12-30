import { Entity } from '@backstage/catalog-model';
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { DatadogApiClient, datadogApiRef } from './api';
import {
  DATADOG_ANNOTATION_DASHBOARD_URL,
  DATADOG_ANNOTATION_GRAPH_TOKEN,
} from './components/useDatadogAppData';

export const isDatadogDashboardAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[DATADOG_ANNOTATION_DASHBOARD_URL]);
export const isDatadogGraphAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[DATADOG_ANNOTATION_GRAPH_TOKEN]);
export const isDatadogAvailable = (entity: Entity) =>
  isDatadogDashboardAvailable(entity) || isDatadogGraphAvailable(entity);

export const entityContentRouteRef = createRouteRef({
  id: 'Datadog Entity Content',
});

export const datadogPlugin = createPlugin({
  id: 'datadog',
  apis: [
    createApiFactory({
      api: datadogApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new DatadogApiClient({ discoveryApi }),
    }),
  ],
  routes: {
    entityContent: entityContentRouteRef,
  },
});

export const EntityDatadogContent = datadogPlugin.provide(
  createRoutableExtension({
    name: 'EntityDatadogContent',
    component: () => import('./Router').then(m => m.Router),
    mountPoint: entityContentRouteRef,
  }),
);

export const EntityDatadogGraphCard = datadogPlugin.provide(
  createComponentExtension({
    name: 'EntityDatadogGraphCard',
    component: {
      lazy: () => import('./components/GraphWidget').then(m => m.GraphWidget),
    },
  }),
);
