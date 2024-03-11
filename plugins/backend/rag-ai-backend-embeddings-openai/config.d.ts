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

export interface Config {
  /**
   * OpenAI Embeddings configuration
   *
   */
  ai: {
    embeddings: {
      openai: {
        /**
         * The API key for accessing OpenAI services. Defaults to process.env.OPENAI_API_KEY
         */
        openAIApiKey?: string;

        /**
         * Name of the OpenAI model to use to create Embeddings. Defaults to text-embedding-3-small
         */
        modelName?: string;

        /**
         * The size of the batch to use when creating embeddings.
         */
        batchSize?: number;

        /**
         * The number of dimensions to generate. Defaults to use the default value from the chosen model
         */
        embeddingsDimensions?: number;
      };
    };
  };
}
