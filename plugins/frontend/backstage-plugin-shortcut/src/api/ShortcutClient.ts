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

import { Story, StoryResponse, User } from './types';
import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';

const DEFAULT_PROXY_PATH = '/shortcut/api';

export type Options = {
  discoveryApi: DiscoveryApi;
  proxyPath?: string;
};

export const shortcutApiRef = createApiRef<ShortcutClient>({
  id: 'plugin.shortcut.service',
});

export class ShortcutClient {
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

  async fetch<T>({ path }: { path?: string }): Promise<T> {
    const response = await fetch(`${await this.getApiUrl()}${path}`);
    const payload = await response.json();
    if (!response.ok) {
      if (payload.message) {
        throw new Error(payload.message);
      }
      throw new Error(payload.errors[0]);
    }

    return payload;
  }

  async fetchStories({ query }: { query: string }): Promise<StoryResponse> {
    const encodedQuery = encodeURIComponent(query);
    return await this.fetch<StoryResponse>({
      path: `/search/stories?page_size=25&query=${encodedQuery}`,
    });
  }

  async fetchOwnedStories({ owner }: { owner?: string }): Promise<Story[]> {
    const query = `owner:${owner}`;
    return (await this.fetchStories({ query })).data;
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${await this.getApiUrl()}/members`);
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.errors[0]);
    }
    return payload;
  }
}
