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
import {
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { EmbeddingDoc, EmbeddingsSource } from '@roadiehq/rag-ai-node';
import { SearchResultSet } from '@backstage/plugin-search-common';
import { Logger } from 'winston';

export type SearchClientQuery = {
  term: string;
  source: EmbeddingsSource;
};

const embeddingsSourceToBackstageSearchType = (source: EmbeddingsSource) => {
  switch (source) {
    case 'catalog':
      return 'software-catalog';
    case 'tech-docs':
      return 'techdocs';
    default:
      return 'software-catalog';
  }
};

export class SearchClient {
  private readonly discoveryApi: PluginEndpointDiscovery;
  private readonly logger: Logger;
  private readonly tokenManager: TokenManager;

  constructor(options: {
    discoveryApi: PluginEndpointDiscovery;
    logger: Logger;
    tokenManager: TokenManager;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.logger = options.logger;
    this.tokenManager = options.tokenManager;
  }

  async query(query: SearchClientQuery): Promise<EmbeddingDoc[]> {
    const url = `${await this.discoveryApi.getBaseUrl('search')}/query?term=${
      query.term
    }&types[0]=${embeddingsSourceToBackstageSearchType(query.source)}`;
    const { token } = await this.tokenManager.getToken();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      this.logger.warn(
        'Unable to query Backstage search API for embeddable results.',
        await response.text(),
      );
      return [];
    }
    const searchResults = (await response.json()) as SearchResultSet;
    return (
      searchResults.results?.map(searchResult => ({
        metadata: {
          source: query.source,
          location: searchResult.document.location,
        },
        content: searchResult.document.text,
      })) ?? []
    );
  }
}
