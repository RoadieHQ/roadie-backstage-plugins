import React from 'react';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityDatadogGraphCard = EntityCardBlueprint.make({
  name: 'datadog-graph',
  params: {
    filter: 'kind:component,resource',
    loader: () =>
      import('../components/GraphWidget').then(m => <m.GraphWidget />),
  },
});
