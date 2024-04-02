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

import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

import {
  AugmentationIndexer,
  RetrievalPipeline,
  augmentationIndexerExtensionPoint,
  retrievalPipelineExtensionPoint,
  modelExtensionPoint,
} from '@roadiehq/rag-ai-node';
import { BaseLLM } from '@langchain/core/language_models/llms';

/**
 * Rag AI backend plugin
 *
 * @public
 */
export const ragAiPlugin = createBackendPlugin({
  pluginId: 'rag-ai',
  register(env) {
    let augmentationIndexer: AugmentationIndexer | undefined;
    let retrievalPipeline: RetrievalPipeline | undefined;
    let model: BaseLLM | undefined;

    env.registerExtensionPoint(augmentationIndexerExtensionPoint, {
      setAugmentationIndexer(indexer) {
        if (augmentationIndexer) {
          throw new Error('AugmentationIndexer may only be set once');
        }
        augmentationIndexer = indexer;
      },
    });

    env.registerExtensionPoint(retrievalPipelineExtensionPoint, {
      setRetrievalPipeline(pipeline) {
        if (retrievalPipeline) {
          throw new Error('RetrievalPipeline may only be set once');
        }
        retrievalPipeline = pipeline;
      },
    });

    env.registerExtensionPoint(modelExtensionPoint, {
      setBaseLLM(llm) {
        if (model) {
          throw new Error('Model may only be set once');
        }
        model = llm;
      },
    });

    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, config, httpRouter }) {
        const winstonLogger = loggerToWinstonLogger(logger);

        if (!(augmentationIndexer && model && retrievalPipeline)) {
          throw new Error('augmentationIndexer must be registered');
        }
        httpRouter.use(
          await createRouter({
            logger: winstonLogger,
            config,
            augmentationIndexer,
            retrievalPipeline,
            model,
          }),
        );
      },
    });
  },
});
