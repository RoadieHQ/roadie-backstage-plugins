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

export {
  /**
   * @deprecated From 0.2.0 new name 'pullRequestsPlugin' should be used
   */
  githubPullRequestsPlugin as plugin,
  githubPullRequestsPlugin,
  EntityGithubPullRequestsContent,
  EntityGithubPullRequestsOverviewCard,
  EntityGithubPullRequestsTable
} from './plugin';
export * from './api';
export {
  /**
   * @deprecated From 0.2.0 composability API should be used
   */
  Router,
  /**
   * @deprecated From 0.2.0 new name 'isPullRequestsAvalilable' should be used
   */
  isGithubPullRequestsAvailable as isPluginApplicableToEntity,
  isGithubPullRequestsAvailable,
} from './components/Router';
export {
  /**
   * @deprecated From 0.2.0 composability API should be used
   */
  PullRequestsStatsCard,
} from './components/PullRequestsStatsCard';

export * from './components/PullRequestsContext'