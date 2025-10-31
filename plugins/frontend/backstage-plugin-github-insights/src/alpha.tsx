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

import {
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { githubApiRef, GithubClient } from './apis';
import { scmAuthApiRef } from '@backstage/integration-react';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { isGithubInsightsAvailable } from './components/utils/isGithubInsightsAvailable';

const githubApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: githubApiRef,
      deps: {
        configApi: configApiRef,
        scmAuthApi: scmAuthApiRef,
      },
      factory: deps => new GithubClient(deps),
    }),
});

const githubInsightsEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/github-insights',
    title: 'GitHub Insights',
    filter: isGithubInsightsAvailable,
    loader: () =>
      import('./components/InsightsPage').then(m => <m.InsightsPage />),
  },
});

const githubInsightsComplianceEntityCard = EntityCardBlueprint.make({
  name: 'compliance',
  params: {
    filter: isGithubInsightsAvailable,
    loader: () =>
      import('./components/Widgets').then(m => <m.ComplianceCard />),
  },
});

const githubInsightsContributorsEntityCard = EntityCardBlueprint.make({
  name: 'contributors',
  params: {
    filter: isGithubInsightsAvailable,
    loader: () =>
      import('./components/Widgets').then(m => <m.ContributorsCard />),
  },
});

const githubInsightsLanguagesEntityCard = EntityCardBlueprint.make({
  name: 'languages',
  params: {
    filter: isGithubInsightsAvailable,
    loader: () => import('./components/Widgets').then(m => <m.LanguagesCard />),
  },
});

const githubInsightsReadmeEntityCard = EntityCardBlueprint.make({
  name: 'readme',
  params: {
    filter: isGithubInsightsAvailable,
    loader: () => import('./components/Widgets').then(m => <m.ReadMeCard />),
  },
});

const githubInsightsReleasesEntityCard = EntityCardBlueprint.make({
  name: 'releases',
  params: {
    filter: isGithubInsightsAvailable,
    loader: () => import('./components/Widgets').then(m => <m.ReleasesCard />),
  },
});

const githubInsightsEnvironmentsEntityCard = EntityCardBlueprint.make({
  name: 'environments',
  params: {
    filter: isGithubInsightsAvailable,
    loader: () =>
      import('./components/Widgets').then(m => <m.EnvironmentsCard />),
  },
});

export default createFrontendPlugin({
  pluginId: 'code-insights',
  extensions: [
    githubApi,
    githubInsightsEntityContent,
    githubInsightsComplianceEntityCard,
    githubInsightsContributorsEntityCard,
    githubInsightsLanguagesEntityCard,
    githubInsightsReadmeEntityCard,
    githubInsightsReleasesEntityCard,
    githubInsightsEnvironmentsEntityCard,
  ],
});
