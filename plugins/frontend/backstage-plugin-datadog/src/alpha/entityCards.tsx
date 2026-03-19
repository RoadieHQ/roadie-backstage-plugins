import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isDatadogGraphAvailable } from '../plugin';

/**
 * @alpha
 */
export const entityDatadogGraphCard = EntityCardBlueprint.make({
  name: 'datadog-graph',
  params: {
    filter: isDatadogGraphAvailable,
    loader: () =>
      import('../components/GraphWidget').then(m => <m.GraphWidget />),
  },
});
