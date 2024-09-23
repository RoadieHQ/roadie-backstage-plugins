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
  EmbeddingsSource,
  RetrievalRouter,
} from '@roadiehq/rag-ai-node';
import { LoggerService } from '@backstage/backend-plugin-api';

export class SourceBasedRetrievalRouter implements RetrievalRouter {
  private readonly logger: LoggerService;
  private readonly retrievers: Map<EmbeddingsSource, AugmentationRetriever[]>;

  constructor({
    logger,
    retrievers,
  }: {
    logger: LoggerService;
    retrievers: Map<EmbeddingsSource, AugmentationRetriever[]>;
  }) {
    this.retrievers = retrievers;
    this.logger = logger;
  }

  async determineRetriever(
    _query: string,
    source: EmbeddingsSource,
  ): Promise<AugmentationRetriever[]> {
    if (this.retrievers.has(source)) {
      return this.retrievers.get(source)!;
    }

    this.logger.warn(
      `Attempted to determine augmentation retriever for a source not implemented yet: ${source}`,
    );
    throw new Error(
      `Attempting to determine augmentation retriever for a source not implemented yet: ${source}`,
    );
  }
}
