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

import { AugmentationIndexer, RetrievalPipeline } from './types';
import { createExtensionPoint } from '@backstage/backend-plugin-api';
import { BaseLLM } from '@langchain/core/language_models/llms';

export interface AugmentationIndexerExtensionPoint {
  setAugmentationIndexer(augmentationIndexer: AugmentationIndexer): void;
}

export const augmentationIndexerExtensionPoint =
  createExtensionPoint<AugmentationIndexerExtensionPoint>({
    id: 'rag-ai.augmentation-indexer',
  });

export interface RetrievalPipelineExtensionPoint {
  setRetrievalPipeline(retrievalPipeline: RetrievalPipeline): void;
}

export const retrievalPipelineExtensionPoint =
  createExtensionPoint<RetrievalPipelineExtensionPoint>({
    id: 'rag-ai.retrieval-pipeline',
  });

export interface ModelExtensionPoint {
  setBaseLLM(baseLLM: BaseLLM): void;
}

export const modelExtensionPoint = createExtensionPoint<ModelExtensionPoint>({
  id: 'rag-ai.model',
});
