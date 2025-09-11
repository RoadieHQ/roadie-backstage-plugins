import { compatWrapper } from '@backstage/core-compat-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const githubPullRequestsEntityCard =
  EntityCardBlueprint.makeWithOverrides({
    config: {
      schema: {
        variant: z =>
          z
            .union([
              z.literal('flex'),
              z.literal('fullHeight'),
              z.literal('gridItem'),
            ])
            .optional(),
      },
    },
    factory(originalFactory, context) {
      const { variant } = context.config;
      return originalFactory({
        filter: { kind: 'component' },
        async loader() {
          const { PullRequestsStatsCard } = await import(
            '../components/PullRequestsStatsCard'
          );
          return compatWrapper(<PullRequestsStatsCard variant={variant} />);
        },
      });
    },
  });
