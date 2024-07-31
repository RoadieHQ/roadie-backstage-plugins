import React from 'react';
import { createEntityCardExtension } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityDatadogGraphCard = createEntityCardExtension({
  name: 'datadog-graph',
  loader: () =>
    import('../components/GraphWidget').then(m => <m.GraphWidget />),
});
