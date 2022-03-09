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

export {
  /**
   * @deprecated since 0.2.0 new name 'buildkitePlugin' should be used
   */
  buildkitePlugin as plugin,
  buildkitePlugin,
  EntityBuildkiteContent,
} from './plugin';
export {
  /**
   * @deprecated since 0.2.0 composability API should be used
   */
  Router,
  isBuildkiteAvailable,
  /**
   * @deprecated since 0.2.0 composability API should be used
   */
  isBuildkiteAvailable as isPluginApplicableToEntity,
} from './components/Router';
export * from './api';
