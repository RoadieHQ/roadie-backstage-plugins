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

export interface Config {
  /**
   * @deepVisibility frontend
   */
  dependabotAlertsConfiguration?: {
    /**
     * Only show alerts with the specified severity levels.
     * low, medium, high, critical
     */
    severity?: string[];
    /**
     * Set a deadline (in days) to display for each severity level of alert.
     */
    deadlines?: {
      low?: number;
      medium?: number;
      high?: number;
      critical?: number;
    };
  };
}
