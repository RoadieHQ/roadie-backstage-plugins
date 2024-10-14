/*
 * Copyright 2024 Larder Software Limited
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
import { WizAPI } from './WizAPI';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export type Options = {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
};

export class WizClient implements WizAPI {
  private readonly discoveryApi: DiscoveryApi;
  private fetchApi: FetchApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async fetchIssuesForProject(projectId: string): Promise<any> {
    const baseUrl = await this.discoveryApi.getBaseUrl('wiz-backend');
    const response = await this.fetchApi.fetch(
      `${baseUrl}/wiz-issues/${projectId}`,
    );
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        'There was an error retrieving issues for specific project',
      );
    }
    return payload.data.issues.nodes;
  }
}
