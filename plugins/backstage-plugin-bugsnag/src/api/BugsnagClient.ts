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
import { BugsnagApi } from './BugsnagApi';
import { BugsnagError, Organisation, Project, TrendData } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';

const DEFAULT_PROXY_PATH = '/bugsnag/api';

export type Options = {
  discoveryApi: DiscoveryApi;
  proxyPath?: string;
};

export class BugsnagClient implements BugsnagApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.proxyPath = options.proxyPath ?? DEFAULT_PROXY_PATH;
  }

  private async getApiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return proxyUrl + this.proxyPath;
  }

  async fetchOrganisations(): Promise<Organisation[]> {
    const response = await fetch(`${await this.getApiUrl()}/user/organizations`);
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload);
    }
    return await response.json();
  }

  async fetchTrends(projectId:string, errorId: string): Promise<TrendData[]> {
    const response = await fetch(`${await this.getApiUrl()}/projects/${projectId}/errors/${errorId}/trend?&buckets_count=10`);
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload);
    }
    return await response.json();
  }

  async fetchProjects(organisationId: string): Promise<Project[]> {
    const response = await fetch(`${await this.getApiUrl()}/organizations/${organisationId}/projects`);
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload);
    }
    return await response.json();
  }

  async fetchErrors(projectId: string): Promise<BugsnagError[]> {
    const response = await fetch(`${await this.getApiUrl()}/projects/${projectId}/errors`);
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload);
    }
    return await response.json();
  }
}
