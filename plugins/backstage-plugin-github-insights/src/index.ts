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
   * @deprecated since v0.3.0 you should use new composability API
   */
  githubInsightsPlugin as plugin,
  githubInsightsPlugin,
  EntityGithubInsightsContent,
  EntityGithubInsightsComplianceCard,
  EntityGithubInsightsContributorsCard,
  EntityGithubInsightsLanguagesCard,
  EntityGithubInsightsReadmeCard,
  EntityGithubInsightsReleasesCard,
} from './plugin';
export {
  Router,
  /**
   * @deprecated since v0.3.0 you should use new name isGithubInsightsAvailable
   */
  isGithubInsightsAvailable as isPluginApplicableToEntity,
  isGithubInsightsAvailable,
} from './components/Router';
/**
 * @deprecated since v0.3.0 you should use new composability API
 */
export * from './components/Widgets';
