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

/** Configuration for the Prometheus plugin */
export interface Config {
  /**
   * @visibility frontend
   */
  prometheus?: {
    /**
     * The proxy path for Prometheus.
     * Should be used if proxy is in use for security etc purposes.
     * @visibility frontend
     */
    proxyPath?: string;

    /**
     * The URL for the Prometheus UI.
     * @visibility frontend
     */
    uiUrl?: string;

    /**
     * The proxy service instances for Prometheus.
     * Should be used if you have multiple Prometheus instances you like to proxy to.
     * @visibility frontend
     */
    instances?: Array<{
      /**
       * The proxy service instance name.
       * Should match the annotation prometheus.io/service-name.
       * @visibility frontend
       */
      name: string;
      /**
       * The proxy path for the service instance.
       * Should match a Backstage proxy.
       * @visibility frontend
       */
      proxyPath: string;
      /**
       * The URL for the Prometheus UI.
       * @visibility frontend
       */
      uiUrl?: string;
    }>;
  };
}
