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

import { createApiRoutes as initializeRagAiBackend } from '@roadiehq/rag-ai-backend';
import { PluginEnvironment } from '../types';
import { createRoadiePgVectorStore } from '@roadiehq/rag-ai-storage-pgvector';
import { CatalogClient } from '@backstage/catalog-client';
import { initializeOpenAiEmbeddings } from '@roadiehq/rag-ai-backend-embeddings-openai';
import { OpenAI } from '@langchain/openai';

export default async function createPlugin({
  logger,
  database,
  discovery,
  config,
}: PluginEnvironment) {
  const catalogApi = new CatalogClient({
    discoveryApi: discovery,
  });

  const vectorStore = await createRoadiePgVectorStore({
    logger,
    database,
    config,
  });

  const bedrockEmbeddings = await initializeOpenAiEmbeddings({
    logger,
    catalogApi,
    vectorStore,
    discovery,
    config,
  });

  const model = new OpenAI();

  const ragAi = await initializeRagAiBackend({
    logger,
    embeddings: bedrockEmbeddings,
    model,
    config,
  });
  return ragAi.router;
}
