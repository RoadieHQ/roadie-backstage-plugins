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
   * Roadie RAG AI configuration
   */
  ai?: {
    /**
     * Texts to inject to the prompts when querying the LLM
     */
    prompts: {
      /**
       * Prefix prompt to add to the query. This prompt is always succeeded by a text blob of embeddings retrieved by the RAG engine
       */
      prefix: string;

      /**
       * Suffix prompt to add to the query. This prompt is always succeeded by text query user has input
       */
      suffix: string;
    };

    /**
     * Supported sources to query information from using RAG. This can be used to omit unnecessary sources from being retrievable
     */
    supportedSources: string[];
  };
}
