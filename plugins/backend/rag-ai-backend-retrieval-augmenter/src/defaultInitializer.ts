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
  DefaultRetrievalPipeline,
  SearchRetriever,
  SourceBasedRetrievalRouter,
  VectorEmbeddingsRetriever,
} from './retrieval';
import { RoadieVectorStore } from '@roadiehq/rag-ai-node';
import { Logger } from 'winston';
import {
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';

export type DefaultRetrievalPipelineOptions = {
  vectorStore: RoadieVectorStore;
  logger: Logger;
  discovery: PluginEndpointDiscovery;
  tokenManager: TokenManager;
};

export const createDefaultRetrievalPipeline = ({
  vectorStore,
  discovery,
  logger,
  tokenManager,
}: DefaultRetrievalPipelineOptions) => {
  const vectorEmbeddingsRetriever = new VectorEmbeddingsRetriever({
    vectorStore: vectorStore,
    logger,
  });

  const searchRetriever = new SearchRetriever({
    discovery,
    logger,
    tokenManager,
  });

  const sourceBasedRetrieverConfig = new Map();
  sourceBasedRetrieverConfig.set('catalog', [
    vectorEmbeddingsRetriever,
    searchRetriever,
  ]);

  const retrievalRouters = [
    new SourceBasedRetrievalRouter({
      logger,
      retrievers: sourceBasedRetrieverConfig,
    }),
  ];
  return new DefaultRetrievalPipeline({
    routers: retrievalRouters,
  });
};
