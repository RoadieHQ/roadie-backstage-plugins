import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityArgoCDOverviewCard = EntityCardBlueprint.make({
  name: 'overviewCard',
  params: {
    filter: { kind: 'component' },
    loader: () =>
      import('../components/ArgoCDDetailsCard').then(m => (
        <m.ArgoCDDetailsCard />
      )),
  },
});

/**
 * @alpha
 */
export const entityArgoCDHistoryCard: any = EntityCardBlueprint.make({
  name: 'historyCard',
  params: {
    filter: { kind: 'component' },
    loader: () =>
      import('../components/ArgoCDHistoryCard').then(m => (
        <m.ArgoCDHistoryCard />
      )),
  },
});
