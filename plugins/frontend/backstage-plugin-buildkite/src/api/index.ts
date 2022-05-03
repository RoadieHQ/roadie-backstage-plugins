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


import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
 } from '@backstage/core-plugin-api';

export const buildKiteApiRef = createApiRef<BuildkiteApi>({
  id: 'plugin.buildkite.service',
});

const DEFAULT_PROXY_PATH = '/buildkite/api';

type Options = {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  /**
   * Path to use for requests via the proxy, defaults to /buildkite/api
   */
  proxyPath?: string;
};

export class BuildkiteApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly proxyPath: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.proxyPath = options.proxyPath ?? DEFAULT_PROXY_PATH;
  }

  private async getApiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}${this.proxyPath}`;
  }

  async getBuilds(
    orgSlug: string,
    pipelineSlug: string,
    page: number,
    per_page: number
  ) {
    const ApiUrl = await this.getApiUrl();
    const request = await this.fetchApi.fetch(
      `${ApiUrl}/organizations/${orgSlug}/pipelines/${pipelineSlug}/builds?page=${page}&per_page=${per_page}`
    );
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`
      );
    }
    return request.json();
  }

  async restartBuild(requestUrl: string) {
    const ApiUrl = await this.getApiUrl();
    const request = await this.fetchApi.fetch(`${ApiUrl}/${requestUrl}/rebuild`, {
      method: 'PUT',
    });
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`
      );
    }
    return request.json();
  }

  async getSingleBuild(
    orgSlug: string,
    pipelineSlug: string,
    buildNumber: number
  ) {
    const ApiUrl = await this.getApiUrl();
    const request = await this.fetchApi.fetch(
      `${ApiUrl}/organizations/${orgSlug}/pipelines/${pipelineSlug}/builds/${buildNumber}`
    );
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`
      );
    }
    return request.json();
  }

  async getLog(url: string) {
    const ApiUrl = await this.getApiUrl();
    const request = await this.fetchApi.fetch(`${ApiUrl}/${url}`);
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`
      );
    }
    return request.json();
  }
}
