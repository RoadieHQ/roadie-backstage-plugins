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
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { LlmService } from './LlmService';
import {
  RoadieEmbeddings,
  RoadieEmbeddingsSource,
} from '@roadiehq/rag-ai-node';

export class RagAiController {
  private static instance: RagAiController;
  private readonly llmService: LlmService;
  private readonly embeddings: RoadieEmbeddings;
  private logger: Logger;

  constructor(
    logger: Logger,
    llmService: LlmService,
    embeddings: RoadieEmbeddings,
  ) {
    this.logger = logger;
    this.llmService = llmService;
    this.embeddings = embeddings;
  }

  static getInstance({
    logger,
    llmService,
    embeddings,
  }: {
    logger: Logger;
    llmService: LlmService;
    embeddings: RoadieEmbeddings;
  }): RagAiController {
    if (!RagAiController.instance) {
      RagAiController.instance = new RagAiController(
        logger,
        llmService,
        embeddings,
      );
    }
    return RagAiController.instance;
  }

  createEmbeddings = async (req: Request, res: Response) => {
    const source = req.params.source as RoadieEmbeddingsSource;
    const entityFilter = req.body.entityFilter;

    this.logger.info(`Creating embeddings for source ${source}`);
    const amountOfEmbeddings = await this.embeddings.createEmbeddings(
      source,
      entityFilter,
    );
    return res.status(200).send({
      response: `${amountOfEmbeddings} embeddings created for source ${source}, for entities with filter ${JSON.stringify(
        entityFilter,
      )}`,
    });
  };

  getEmbeddings = async (req: Request, res: Response) => {
    const source = req.params.source as RoadieEmbeddingsSource;
    const query = req.query.query as string;

    const response = await this.embeddings.getEmbeddingDocs(query, source);
    return res.status(200).send({ response });
  };

  deleteEmbeddings = async (req: Request, res: Response) => {
    const source = req.params.source as RoadieEmbeddingsSource;
    const entityFilter = req.body.entityFilter;
    await this.embeddings.deleteEmbeddings(source, entityFilter);
    return res
      .status(201)
      .send({ response: `Embeddings deleted for source ${source}` });
  };

  query = async (req: Request, res: Response) => {
    // TODO: Remove the need for source in query when we have magical abilities to create very good embeddings
    const source = req.params.source as RoadieEmbeddingsSource;
    const query = req.body.query;

    const embeddingDocs = await this.embeddings.getEmbeddingDocs(query, source);
    const llmResponse = await this.llmService.query(embeddingDocs, query);
    return res
      .status(200)
      .send({ response: llmResponse, embeddings: embeddingDocs });
  };
}
