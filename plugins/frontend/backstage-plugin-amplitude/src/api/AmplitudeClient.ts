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

import { AmplitudeApi, ChartData } from './AmplitudeApi';
import { FetchApi, DiscoveryApi } from '@backstage/core-plugin-api';

type Options = {
  fetchApi: FetchApi;
  discoveryApi: DiscoveryApi;
};

export class AmplitudeClient implements AmplitudeApi {
  private readonly fetchApi: FetchApi;
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.fetchApi = options.fetchApi;
    this.discoveryApi = options.discoveryApi;
  }

  async getChart(options: { chartId: string }): Promise<ChartData> {
    const { chartId } = options;
    const url = this.discoveryApi.getBaseUrl('amplitude');
    const response = await this.fetchApi.fetch(
      `${url}/3/chart/${chartId}/query`,
    );
    if (!response.ok) {
      throw new Error(`Failed to retrieve chart: ${response.statusText}`);
    }
    return await response.json();
  }
}
