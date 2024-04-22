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

export type AccountConfig = {
  /*
   * The URL of the Okta organization.
   * @visibility frontend
   */
  orgUrl: string;
  /*
   * The API token to use for authentication.
   * @visibility secret
   */
  token?: string;
  oauth?: {
    /*
     * The client ID.
     * @visibility secret
     */
    clientId: string;
    /*
     * The client key.
     * @visibility secret
     */
    keyId?: string;
    /*
     * The private key.
     * @visibility secret
     */
    privateKey: string;
  };
  /*
   * The user filter to apply when fetching users.
   * @visibility frontend
   */
  userFilter?: string;
  /*
   * The group filter to apply when fetching groups.
   * @visibility frontend
   */
  groupFilter?: string;
};
