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
import { initializeBedrockEmbeddings } from '@roadiehq/rag-ai-backend-embeddings-aws';
import { createRoadiePgVectorStore } from '@roadiehq/rag-ai-storage-pgvector';
import { Bedrock } from '@langchain/community/llms/bedrock/web';
import { CatalogClient } from '@backstage/catalog-client';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';

export default async function createPlugin({
  logger,
  database,
  discovery,
  config,
}: PluginEnvironment) {
  const catalogApi = new CatalogClient({
    discoveryApi: discovery,
  });

  const vectorStore = await createRoadiePgVectorStore({ logger, database });
  const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(config);
  const credProvider = await awsCredentialsManager.getCredentialProvider();

  const bedrockEmbeddings = await initializeBedrockEmbeddings({
    logger,
    catalogApi,
    vectorStore,
    discovery,
    config,
    options: {
      credentials: credProvider.sdkCredentialProvider,
      region: 'eu-central-1',
    },
  });

  const model = new Bedrock({
    maxTokens: 4096,
    model: 'anthropic.claude-instant-v1', // 'amazon.titan-text-express-v1', 'anthropic.claude-v2',
    region: 'eu-central-1',
    credentials: credProvider.sdkCredentialProvider,
  });

  const ragAi = await initializeRagAiBackend({
    logger,
    embeddings: bedrockEmbeddings,
    model,
    config,
  });
  return ragAi.router;
}
