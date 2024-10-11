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
import { TokenManager } from '@backstage/backend-common';
import { BedrockEmbeddings } from '@langchain/aws';
import { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import {
  DefaultVectorAugmentationIndexer,
  RoadieEmbeddingsConfig,
} from '@roadiehq/rag-ai-backend-retrieval-augmenter';
import { BedrockCohereEmbeddings } from './BedrockCohereEmbeddings';

export type BedrockConfig = {
  modelName: string;
};

export class RoadieBedrockAugmenter extends DefaultVectorAugmentationIndexer {
  constructor(
    config: RoadieEmbeddingsConfig & {
      options: {
        credentials: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
        region: string;
      };
      bedrockConfig: BedrockConfig;
      tokenManager: TokenManager;
    },
  ) {
    const embeddingsConfig = {
      region: config.options.region,
      credentials: config.options.credentials,
      model: config.bedrockConfig.modelName,
    };
    const embeddings = config.bedrockConfig.modelName.includes('cohere')
      ? new BedrockCohereEmbeddings({ ...embeddingsConfig, maxRetries: 3 })
      : new BedrockEmbeddings({ ...embeddingsConfig, maxRetries: 3 });

    super({ ...config, embeddings });
  }
}
