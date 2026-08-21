/*
 * Copyright 2021 Larder Software Limited
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
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { scmAuthApiRef } from '@backstage/integration-react';
import { githubPullRequestsApiRef, GithubPullRequestsClient } from './api';
import {
  isGithubPullRequestsAvailable,
  isGithubTeamPullRequestsAvailable,
} from './components/Router';

/**
 * @alpha
 */
export const githubPullRequestsApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: githubPullRequestsApiRef,
      deps: {
        configApi: configApiRef,
        scmAuthApi: scmAuthApiRef,
      },
      factory: ({ configApi, scmAuthApi }) =>
        new GithubPullRequestsClient({ configApi, scmAuthApi }),
    }),
});

/**
 * @alpha
 */
export const entityGithubPullRequestsContent = EntityContentBlueprint.make({
  params: {
    path: '/pull-requests',
    title: 'Pull/Merge Requests',
    filter: isGithubPullRequestsAvailable,
    loader: () =>
      import('./components/Router').then(m => <m.Router />),
  },
});

/**
 * @alpha
 */
export const entityGithubPullRequestsOverviewCard = EntityCardBlueprint.make({
  name: 'overview',
  params: {
    filter: isGithubPullRequestsAvailable,
    loader: () =>
      import('./components/PullRequestsStatsCard').then(
        m => <m.PullRequestsStatsCard />,
      ),
  },
});

/**
 * @alpha
 */
export const entityGithubPullRequestsTable = EntityCardBlueprint.make({
  name: 'table',
  params: {
    filter: isGithubPullRequestsAvailable,
    loader: () =>
      import('./components/PullRequestsTable').then(m => <m.PullRequestsTable />),
  },
});

/**
 * @alpha
 */
export const entityGithubGroupPullRequestsCard = EntityCardBlueprint.make({
  name: 'group',
  params: {
    filter: isGithubTeamPullRequestsAvailable,
    loader: () =>
      import('./components/GroupPullRequestsCard').then(
        m => <m.Content />,
      ),
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'github-pull-requests',
  extensions: [
    githubPullRequestsApi,
    entityGithubPullRequestsContent,
    entityGithubPullRequestsOverviewCard,
    entityGithubPullRequestsTable,
    entityGithubGroupPullRequestsCard,
  ],
});
