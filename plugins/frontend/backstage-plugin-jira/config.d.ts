/*
 * Copyright 2022 Larder Software Limited
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

/** Configuration for the Jira plugin */
export interface Config {
  jira?: {
    /**
     * The proxy path for Jira.
     * Should be used if proxy is in use for security etc purposes.
     * @visibility frontend
     */
    proxyPath?: string;

    /**
     * In case Confluence is also used, when filtering by component
     * the activities from there would also appear, add this config to
     * remove all those occurrences from the Activity Stream.
     * @visibility frontend
     */
    confluenceActivityFilter?: string;

    /**
     * The verison of the Jira API
     * Should be used if you do not want to use the latest Jira API.
     * @visibility frontend
     */
    apiVersion?: number;
  };
}
