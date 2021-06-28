/*
 * Copyright 2020 RoadieHQ
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

import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
} from '@backstage/core-plugin-api';

export const entityContentRouteRef = createRouteRef({
  title: 'githubInsights Entity Content',
});

export const githubInsightsPlugin = createPlugin({
  id: 'code-insights',
  routes: {
    entityContent: entityContentRouteRef,
  },
});

export const EntityGithubInsightsContent = githubInsightsPlugin.provide(
  createRoutableExtension({
    component: () => import('./components/Router').then((m) => m.Router),
    mountPoint: entityContentRouteRef,
  })
);

export const EntityGithubInsightsComplianceCard = githubInsightsPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/Widgets/index').then((m) => m.ComplianceCard),
    },
  })
);

export const EntityGithubInsightsContributorsCard = githubInsightsPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/Widgets/index').then((m) => m.ContributorsCard),
    },
  })
);

export const EntityGithubInsightsLanguagesCard = githubInsightsPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/Widgets/index').then((m) => m.LanguagesCard),
    },
  })
);

export const EntityGithubInsightsReadmeCard = githubInsightsPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/Widgets/index').then((m) => m.ReadMeCard),
    },
  })
);

export const EntityGithubInsightsReleasesCard = githubInsightsPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/Widgets/index').then((m) => m.ReleasesCard),
    },
  })
);
