import { compatWrapper } from '@backstage/core-compat-api';
import { createEntityCardExtension } from '@backstage/plugin-catalog-react/alpha';
import React from 'react';

/**
 * @alpha
 */
export const entityArgoCDOverviewCard: any = createEntityCardExtension({
  name: 'overviewCard',
  loader: () =>
    import('../components/ArgoCDDetailsCard').then(m =>
      compatWrapper(<m.ArgoCDDetailsCard />),
    ),
});

/**
 * @alpha
 */
export const entityArgoCDHistoryCard: any = createEntityCardExtension({
  name: 'historyCard',
  loader: () =>
    import('../components/ArgoCDHistoryCard').then(m =>
      compatWrapper(<m.ArgoCDHistoryCard />),
    ),
});
