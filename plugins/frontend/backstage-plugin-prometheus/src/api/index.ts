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

const DEFAULT_PROXY_PATH = '/prometheus/api';

export const prometheusApiRef = createApiRef<PrometheusApi>({
  id: 'plugin.prometheus.service',
});

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class PrometheusApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
  }

  private async getApiUrl({ serviceName }: { serviceName?: string }) {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}${this.getProxyPath({ serviceName })}`;
  }

  private getProxyPath({ serviceName }: { serviceName?: string }) {
    if (Boolean(serviceName)) {
      const instances = this.configApi.getOptionalConfigArray(
        'prometheus.instances',
      );
      if (instances && instances?.length > 0) {
        const instance = instances.find(
          value => value.getString('name') === serviceName,
        );
        if (Boolean(instance)) {
          // @ts-ignore
          return instance.getString('proxyPath');
        }
      }
    }
    return (
      this.configApi.getOptionalString('prometheus.proxyPath') ||
      DEFAULT_PROXY_PATH
    );
  }

  async query({
    query = `up`,
    range = { hours: 1 },
    step = 14,
    serviceName,
  }: {
    query: string;
    range: {
      hours?: number;
      minutes?: number;
    };
    step?: number;
    serviceName?: string;
  }) {
    const apiUrl = await this.getApiUrl({ serviceName });

    const end = DateTime.now().toSeconds();
    const start = DateTime.now().minus(Duration.fromObject(range)).toSeconds();
    const response = await fetch(
      `${apiUrl}/query_range?query=${query}&start=${start}&end=${end}&step=${step}`,
    );
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return response.json();
  }

  async getAlerts({ serviceName }: { serviceName?: string }) {
    const apiUrl = await this.getApiUrl({ serviceName });
    const response = await fetch(`${apiUrl}/rules?type=alert`);

    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return response.json();
  }
}
