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
  EntityFilterShape,
  RoadieVectorStore,
} from '@roadiehq/rag-ai-node';
import { Logger } from 'winston';

export class VectorEmbeddingsRetriever implements AugmentationRetriever {
  private readonly logger: Logger;
  private readonly vectorStore: RoadieVectorStore;

  constructor({
    vectorStore,
    logger,
  }: {
    vectorStore: RoadieVectorStore;
    logger: Logger;
  }) {
    this.vectorStore = vectorStore;
    this.logger = logger;
  }

  public get id() {
    return 'VectorEmbeddingsRetriever';
  }

  async retrieve(
    query: string,
    source: EmbeddingsSource,
    _filter?: EntityFilterShape,
  ): Promise<EmbeddingDoc[]> {
    const embeddings = await this.vectorStore.similaritySearch(query, {
      source: source !== 'all' ? source : undefined,
    });

    this.logger.info(
      `Received ${embeddings.length} embeddings from Vector store`,
    );
    return embeddings;
  }
}
