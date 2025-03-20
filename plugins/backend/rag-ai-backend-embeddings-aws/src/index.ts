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
import { AugmentationIndexer, RoadieVectorStore } from '@roadiehq/rag-ai-node';
import {
  BedrockConfig,
  RoadieBedrockAugmenter,
} from './RoadieBedrockAugmenter';
import { CatalogApi } from '@backstage/catalog-client';
import {
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { Config } from '@backstage/config';
import { AugmentationOptions } from '@roadiehq/rag-ai-backend-retrieval-augmenter';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';

export interface RoadieBedrockEmbeddingsConfig {
  logger: Logger | LoggerService;
  vectorStore: RoadieVectorStore;
  catalogApi: CatalogApi;
  tokenManager?: TokenManager;
  auth?: AuthService;
  discovery: PluginEndpointDiscovery;
  config: Config;
  options: {
    credentials: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
    region: string;
  };
}

export async function initializeBedrockEmbeddings({
  logger,
  vectorStore,
  catalogApi,
  tokenManager,
  auth,
  discovery,
  config,
  options,
}: RoadieBedrockEmbeddingsConfig): Promise<AugmentationIndexer> {
  logger.info('Initializing Roadie AWS Bedrock Embeddings');
  const bedrockConfig = config.get<BedrockConfig>('ai.embeddings.bedrock');
  const embeddingsOptions = config.getOptionalConfig('ai.embeddings');
  const augmentationOptions: AugmentationOptions = {};
  if (embeddingsOptions) {
    augmentationOptions.chunkSize =
      embeddingsOptions.getOptionalNumber('chunkSize');
    augmentationOptions.chunkOverlap =
      embeddingsOptions.getOptionalNumber('chunkOverlap');
    augmentationOptions.concurrencyLimit =
      embeddingsOptions.getOptionalNumber('concurrencyLimit');
  }
  return new RoadieBedrockAugmenter({
    vectorStore,
    catalogApi,
    discovery,
    logger: logger.child({ label: 'roadie-bedrock-embedder' }),
    options,
    bedrockConfig,
    auth,
    tokenManager,
    augmentationOptions,
  });
}
