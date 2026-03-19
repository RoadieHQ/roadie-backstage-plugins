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
import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  /**
   * Glean plugin configuration.
   */
  glean?: {
    /**
     * The index url of the Glean API
     */
    apiIndexUrl: string;

    /**
     * The data source of the Glean API to use
     * See: https://support.glean.com/hc/en-us/articles/30038992119451-Data-Sources
     */
    datasource: string;

    /**
     * The api token
     * @visibility secret
     */
    token: string;

    /**
     * The Scheduler for how often to run Glean indexing
     */
    schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
  };
}
