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

import { CloudsmithApi, RepoStats } from './CloudsmithApi';
import { FetchApi, DiscoveryApi } from '@backstage/core-plugin-api';

type Options = {
  fetchApi: FetchApi;
  discoveryApi: DiscoveryApi;
};

export class CloudsmithClient implements CloudsmithApi {
  private readonly fetchApi: FetchApi;
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.fetchApi = options.fetchApi;
    this.discoveryApi = options.discoveryApi;
  }

  private async getApiUrl(): Promise<string> {
    return `${await this.discoveryApi.getBaseUrl('proxy')}/cloudsmith`;
  }

  async getRepoMetrics({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepoStats> {
    const cloudsmithApiUrl = await this.getApiUrl();
    const response = await this.fetchApi.fetch(
      `${cloudsmithApiUrl}/metrics/packages/${owner}/${repo}/`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to retrieve package metrics: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  async getAuditLog({ owner }: { owner: string }): Promise<any> {
    const cloudsmithApiUrl = await this.getApiUrl();
    const response = await this.fetchApi.fetch(
      `${cloudsmithApiUrl}/audit-log/${owner}/`,
    );
    if (!response.ok) {
      throw new Error(`Failed to retrieve audit logs: ${response.statusText}`);
    }
    return await response.json();
  }
}
