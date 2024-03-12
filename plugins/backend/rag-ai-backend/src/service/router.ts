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
import { errorHandler } from '@backstage/backend-common';
import express, { NextFunction, Request, Response } from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { AugmentationIndexer, RetrievalPipeline } from '@roadiehq/rag-ai-node';
import { BaseLLM } from '@langchain/core/language_models/llms';
import { LlmService } from './LlmService';
import { RagAiController } from './RagAiController';
import { isEmpty } from 'lodash';
import { Config } from '@backstage/config';

type AiBackendConfig = {
  prompts: {
    prefix: string;
    suffix: string;
  };
  supportedSources: string[];
};

export interface RouterOptions {
  logger: Logger;
  augmentationIndexer: AugmentationIndexer;
  retrievalPipeline: RetrievalPipeline;
  model: BaseLLM;
  config: Config;
}

const sourceValidator =
  (supportedSources: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const source = req.params.source;
    if (!supportedSources.includes(source)) {
      return res.status(422).json({
        message: `Only ${supportedSources.join(
          ', ',
        )} are supported as AI assistant query sources for now.`,
      });
    }
    return next();
  };

const queryQueryValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const query = req.query.query;
  if (!query || typeof query !== 'string' || isEmpty(query)) {
    return res.status(422).json({
      message: 'You should pass in the query via query params',
    });
  }
  return next();
};
const bodyQueryValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const query = req.body.query;
  if (!query || typeof query !== 'string' || isEmpty(query)) {
    return res.status(422).json({
      message: 'You should pass in the query via request body',
    });
  }
  return next();
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, augmentationIndexer, retrievalPipeline, model, config } =
    options;
  const aiBackendConfig = config.getOptional<AiBackendConfig>('ai');
  const supportedSources = aiBackendConfig?.supportedSources ?? ['catalog'];
  const llmService = new LlmService({
    logger,
    model,
    configuredPrompts: aiBackendConfig?.prompts,
  });
  const controller = RagAiController.getInstance({
    logger,
    augmentationIndexer,
    retrievalPipeline,
    llmService,
  });
  const router = Router();
  router.use(express.json());

  const sourceValidatorMiddleware = sourceValidator(supportedSources);
  router
    .route('/embeddings/:source')
    .post(sourceValidatorMiddleware, controller.createEmbeddings)
    .delete(sourceValidatorMiddleware, controller.deleteEmbeddings)
    .get(
      sourceValidatorMiddleware,
      queryQueryValidator,
      controller.getEmbeddings,
    );

  router
    .route('/query/:source')
    .post(sourceValidatorMiddleware, bodyQueryValidator, controller.query);

  router.use(errorHandler());
  return router;
}
