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
  ConfigApi,
  createApiRef,
  DiscoveryApi,
} from '@backstage/core-plugin-api';
import { DateTime, Duration } from 'luxon';

export const prometheusApiRef = createApiRef<PrometheusApi>({
  id: 'plugin.prometheus.service',
  description: 'Used by the Prometheus plugin to make requests',
});

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  /**
   * Path to use for requests via the proxy, defaults to /prometheus/api
   */
};

export class PrometheusApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath?: string;
  private readonly baseUrl?: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.proxyPath = options.configApi.getOptionalString(
      'prometheus.proxyPath',
    );
    this.baseUrl = options.configApi.getOptionalString('prometheus.baseUrl');
  }

  private async getApiUrl() {
    if (this.proxyPath) {
      const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
      return `${proxyUrl}${this.proxyPath}`;
    }
    if (this.baseUrl) {
      return this.baseUrl;
    }
    throw new Error('Failed to determine URL for Prometheus.');
  }

  async query({
    query = `up`,
    range = { hours: 1 },
    step = 14,
  }: {
    query: string;
    range: {
      hours?: number;
      minutes?: number;
    };
    step?: number;
  }) {
    const apiUrl = await this.getApiUrl();

    const end = DateTime.now().toSeconds();
    const start = DateTime.now()
      .minus(Duration.fromObject(range))
      .toSeconds();
    const response = await fetch(
      `${apiUrl}/api/v1/query_range?query=${query}&start=${start}&end=${end}&step=${step}`,
    );
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return response.json();
  }

  async getAlerts() {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/api/v1/rules?type=alert`);

    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return response.json();
  }
}
