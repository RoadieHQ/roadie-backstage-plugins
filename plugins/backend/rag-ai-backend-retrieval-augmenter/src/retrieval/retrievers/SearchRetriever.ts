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
  AugmentationRetriever,
  EmbeddingDoc,
  EmbeddingsSource,
} from '@roadiehq/rag-ai-node';
import { SearchClient } from './SearchClient';
import {
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';

export class SearchRetriever implements AugmentationRetriever {
  private readonly searchClient: SearchClient;
  private readonly logger: LoggerService;

  constructor({
    discovery,
    logger,
    searchClient,
    auth,
    tokenManager,
  }: {
    discovery: PluginEndpointDiscovery;
    logger: LoggerService;
    searchClient?: SearchClient;
    auth?: AuthService;
    tokenManager?: TokenManager;
  }) {
    this.searchClient =
      searchClient ??
      new SearchClient({
        discoveryApi: discovery,
        logger: logger.child({ label: 'rag-ai-searchclient' }),
        auth,
        tokenManager,
      });
    this.logger = logger;
  }

  public get id() {
    return 'SearchRetriever';
  }

  async retrieve(
    query: string,
    source: EmbeddingsSource,
  ): Promise<EmbeddingDoc[]> {
    const queryResults = await this.searchClient.query({
      term: query,
      source: source,
    });
    this.logger.info(
      `Received ${queryResults.length} results when querying augmentations from search.`,
    );
    return queryResults;
  }
}
