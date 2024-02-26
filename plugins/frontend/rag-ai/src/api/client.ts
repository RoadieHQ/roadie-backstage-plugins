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
import { ConfigApi, DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { RagAiApi } from './ragApi';
import { RoadieLlmResponse } from '../types';

export class RoadieRagAiClient implements RagAiApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly configApi: ConfigApi;
  private baseUrl?: string;

  constructor({
    discoveryApi,
    fetchApi,
    configApi,
  }: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    configApi: ConfigApi;
  }) {
    this.discoveryApi = discoveryApi;
    this.fetchApi = fetchApi;
    this.configApi = configApi;
  }

  private async getBaseUrl(): Promise<string> {
    if (!this.baseUrl) {
      const endpointPath = this.configApi.getOptionalString('ai.endpointPath');
      this.baseUrl = await this.discoveryApi.getBaseUrl(
        endpointPath ?? 'rag-ai',
      );
    }
    return this.baseUrl;
  }

  private async fetch(path: string, options: {} = {}) {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/${path}`, options);
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`Failed to retrieved data from path ${path}`);
  }

  async ask(question: string): Promise<RoadieLlmResponse> {
    const response = await this.fetch(`query/catalog`, {
      body: JSON.stringify({
        query: question,
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response;
  }
}
