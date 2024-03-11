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
  AugmentationPostProcessor,
  AugmentationRetriever,
  EmbeddingDoc,
  EmbeddingsSource,
  EntityFilterShape,
  RetrievalPipeline,
  RetrievalRouter,
} from '@roadiehq/rag-ai-node';
import { CombiningPostProcessor } from './postProcessors/CombiningPostProcessor';

export class DefaultRetrievalPipeline implements RetrievalPipeline {
  private readonly routers: RetrievalRouter[];
  private readonly retrievers: AugmentationRetriever[];
  private readonly postProcessors: AugmentationPostProcessor[];

  constructor({
    routers,
    retrievers,
    postProcessors,
  }: {
    routers?: RetrievalRouter[];
    retrievers?: AugmentationRetriever[];
    postProcessors?: AugmentationPostProcessor[];
  }) {
    this.routers = routers ?? [];
    this.retrievers = retrievers ?? [];
    this.postProcessors = postProcessors ?? [new CombiningPostProcessor()];
  }

  async retrieveAugmentationContext(
    query: string,
    source: EmbeddingsSource,
    filter?: EntityFilterShape,
  ): Promise<EmbeddingDoc[]> {
    const routedRetrievers = (
      await Promise.all(
        this.routers.map(router => router.determineRetriever(query, source)),
      )
    ).flat();
    const augmentations: Map<string, EmbeddingDoc[]> = new Map();
    for (const retriever of [...this.retrievers, ...routedRetrievers]) {
      augmentations.set(
        retriever.id,
        await retriever.retrieve(query, source, filter),
      );
    }

    return (
      await Promise.all(
        this.postProcessors.map(postProcessor =>
          postProcessor.process(query, source, augmentations),
        ),
      )
    ).flat();
  }
}
