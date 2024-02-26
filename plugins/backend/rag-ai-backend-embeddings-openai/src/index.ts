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

import { Logger } from 'winston';
import { RoadieEmbeddings, RoadieVectorStore } from '@roadiehq/rag-ai-node';
import { OpenAiConfig, RoadieOpenAiEmbeddings } from './RoadieOpenAiEmbeddings';
import { CatalogApi } from '@backstage/catalog-client';
import { PluginEndpointDiscovery } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import {
  SearchClient,
  SplitterOptions,
} from '@roadiehq/rag-ai-backend-embeddings';

export interface RoadieBedrockEmbeddingsConfig {
  logger: Logger;
  vectorStore: RoadieVectorStore;
  catalogApi: CatalogApi;
  discovery: PluginEndpointDiscovery;
  config: Config;
}

export async function initializeOpenAiEmbeddings({
  logger,
  vectorStore,
  catalogApi,
  discovery,
  config,
}: RoadieBedrockEmbeddingsConfig): Promise<RoadieEmbeddings> {
  logger.info('Initializing Roadie OpenAI Embeddings');
  const searchClient = new SearchClient({
    discoveryApi: discovery,
    logger: logger.child({ label: 'openai-embeddings-searchclient' }),
  });
  const openAiConfig = config.get<OpenAiConfig>('ai.embeddings.openai');

  const embeddingsOptions = config.getOptionalConfig('ai.embeddings');
  const splitterOptions: SplitterOptions = {};
  if (embeddingsOptions) {
    splitterOptions.chunkSize =
      embeddingsOptions.getOptionalNumber('chunkSize');
    splitterOptions.chunkOverlap =
      embeddingsOptions.getOptionalNumber('chunkOverlap');
  }
  return new RoadieOpenAiEmbeddings({
    vectorStore,
    catalogApi,
    searchClient,
    discovery,
    splitterOptions,
    logger: logger.child({ label: 'roadie-openai-embeddings' }),
    config: openAiConfig,
  });
}
