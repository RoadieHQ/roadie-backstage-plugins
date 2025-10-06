/*
 * Copyright 2025 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { compatWrapper } from '@backstage/core-compat-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const githubInsightsComplianceEntityCard = EntityCardBlueprint.make({
  name: 'compliance',
  params: {
    filter: { kind: 'component' },
    async loader() {
      const { ComplianceCard } = await import('../components/Widgets/index');
      return compatWrapper(<ComplianceCard />);
    },
  },
});

/**
 * @alpha
 */
export const githubInsightsContributorsEntityCard = EntityCardBlueprint.make({
  name: 'contributors',
  params: {
    filter: { kind: 'component' },
    async loader() {
      const { ContributorsCard } = await import('../components/Widgets/index');
      return compatWrapper(<ContributorsCard />);
    },
  },
});

/**
 * @alpha
 */
export const githubInsightsLanguagesEntityCard = EntityCardBlueprint.make({
  name: 'languages',
  params: {
    filter: { kind: 'component' },
    async loader() {
      const { LanguagesCard } = await import('../components/Widgets/index');
      return compatWrapper(<LanguagesCard />);
    },
  },
});

/**
 * @alpha
 */
export const githubInsightsReadmeEntityCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'readme',
    config: {
      schema: {
        title: z => z.string().optional(),
        maxHeight: z => z.number().optional(),
      },
    },
    factory(originalFactory, context) {
      const { maxHeight, title } = context.config;
      return originalFactory({
        filter: { kind: 'component' },
        async loader() {
          const { ReadMeCard } = await import('../components/Widgets/index');
          return compatWrapper(
            <ReadMeCard title={title} maxHeight={maxHeight} />,
          );
        },
      });
    },
  });

/**
 * @alpha
 */
export const githubInsightsReleasesEntityCard = EntityCardBlueprint.make({
  name: 'releases',
  params: {
    filter: { kind: 'component' },
    async loader() {
      const { ReleasesCard } = await import('../components/Widgets/index');
      return compatWrapper(<ReleasesCard />);
    },
  },
});

/**
 * @alpha
 */
export const githubInsightsEnvironmentsEntityCard = EntityCardBlueprint.make({
  name: 'environments',
  params: {
    filter: { kind: 'component' },
    async loader() {
      const { EnvironmentsCard } = await import('../components/Widgets/index');
      return compatWrapper(<EnvironmentsCard />);
    },
  },
});
