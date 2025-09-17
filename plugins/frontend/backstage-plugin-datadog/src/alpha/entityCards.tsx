import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { DATADOG_ANNOTATION_GRAPH_TOKEN } from '../components/useDatadogAppData';

/**
 * @alpha
 */
export const entityDatadogGraphCard = EntityCardBlueprint.make({
  name: 'datadog-graph',
  params: {
    filter: {
      [`metadata.annotations.${DATADOG_ANNOTATION_GRAPH_TOKEN}`]: {
        $exists: true,
      },
    },
    loader: () =>
      import('../components/GraphWidget').then(m => <m.GraphWidget />),
  },
});
