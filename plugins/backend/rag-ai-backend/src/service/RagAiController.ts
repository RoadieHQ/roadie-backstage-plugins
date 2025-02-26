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
import { LoggerService } from '@backstage/backend-plugin-api';

import { LlmService } from './LlmService';
import {
  AugmentationIndexer,
  EmbeddingsSource,
  RetrievalPipeline,
} from '@roadiehq/rag-ai-node';
// @ts-ignore
import type compression from 'compression';

type UsageMetadata = {
  total_tokens: number;
  output_tokens: number;
  input_tokens: number;
};

export class RagAiController {
  private static instance: RagAiController;
  private readonly llmService: LlmService;
  private readonly augmentationIndexer: AugmentationIndexer;
  private readonly retrievalPipeline?: RetrievalPipeline;
  private logger: Logger | LoggerService;

  constructor(
    logger: Logger | LoggerService,
    llmService: LlmService,
    augmentationIndexer: AugmentationIndexer,
    retrievalPipeline?: RetrievalPipeline,
  ) {
    this.logger = logger;
    this.llmService = llmService;
    this.augmentationIndexer = augmentationIndexer;
    this.retrievalPipeline = retrievalPipeline;
  }

  static getInstance({
    logger,
    llmService,
    augmentationIndexer,
    retrievalPipeline,
  }: {
    logger: Logger | LoggerService;
    llmService: LlmService;
    augmentationIndexer: AugmentationIndexer;
    retrievalPipeline?: RetrievalPipeline;
  }): RagAiController {
    if (!RagAiController.instance) {
      RagAiController.instance = new RagAiController(
        logger,
        llmService,
        augmentationIndexer,
        retrievalPipeline,
      );
    }
    return RagAiController.instance;
  }

  createEmbeddings = async (req: Request, res: Response) => {
    const source = req.params.source as EmbeddingsSource;
    const entityFilter = req.body.entityFilter;

    this.logger.info(`Creating embeddings for source ${source}`);
    const amountOfEmbeddings = await this.augmentationIndexer.createEmbeddings(
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
    if (!this.retrievalPipeline) {
      return res.status(500).send({
        message: 'No retrieval pipeline configured for this AI backend. ',
      });
    }

    const source = req.params.source as EmbeddingsSource;
    const query = req.query.query as string;
    const entityFilter = req.body.entityFilter;

    const response = await this.retrievalPipeline.retrieveAugmentationContext(
      query,
      source,
      entityFilter,
    );
    return res.status(200).send({ response });
  };

  deleteEmbeddings = async (req: Request, res: Response) => {
    const source = req.params.source as EmbeddingsSource;
    const entityFilter = req.body.entityFilter;
    await this.augmentationIndexer.deleteEmbeddings(source, entityFilter);
    return res
      .status(201)
      .send({ response: `Embeddings deleted for source ${source}` });
  };

  query = async (req: Request, res: Response) => {
    // TODO: Remove the need for source in query when we have magical abilities to create very good embeddings
    const source = req.params.source as EmbeddingsSource;
    const query = req.body.query;
    const entityFilter = req.body.entityFilter;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    });

    try {
      const embeddingDocs = this.retrievalPipeline
        ? await this.retrievalPipeline.retrieveAugmentationContext(
            query,
            source,
            entityFilter,
          )
        : [];

      const embeddingsEvent = `event: embeddings\n`;
      const embeddingsData = `data: ${JSON.stringify(embeddingDocs)}\n\n`;
      res.write(embeddingsEvent + embeddingsData);

      const stream = await this.llmService.query(embeddingDocs, query);
      const usage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

      for await (const chunk of stream) {
        if (typeof chunk !== 'string' && 'usage_metadata' in chunk) {
          usage.input_tokens +=
            (chunk.usage_metadata as UsageMetadata)?.input_tokens ?? 0;
          usage.output_tokens +=
            (chunk.usage_metadata as UsageMetadata)?.output_tokens ?? 0;
          usage.total_tokens +=
            (chunk.usage_metadata as UsageMetadata)?.total_tokens ?? 0;
        }

        const text =
          typeof chunk === 'string' ? chunk : (chunk.content as string);
        const event = `event: response\n`;
        const data = this.parseSseText(text);
        res.write(event + data);
        res.flush?.();
      }

      if (Object.values(usage).some(it => it !== 0)) {
        this.logger.info(
          `Produced response with token usage: ${JSON.stringify(usage)}`,
        );
        res.write(`event: usage\n` + `data: ${JSON.stringify(usage)}\n\n`);
      } else {
        this.logger.info(
          `Unable to retrieve token usage information from this model invocation.`,
        );
        res.write(
          `event: usage\n` +
            `data: ${JSON.stringify({
              input_tokens: -1,
              output_tokens: -1,
              total_tokens: -1,
            })}\n\n`,
        );
      }
    } catch (e: any) {
      this.logger.error(
        `There was an error executing query ${query} for source ${source} on entity ${entityFilter}: ${e.message}`,
        e,
      );
      throw e;
    }

    res.end();
  };

  private parseSseText = (text: string): string => {
    const lines = text.split('\n');

    const output = lines.reduce((result, line) => {
      const data = `data: ${line}\n`;
      return result + data;
    }, '');

    return `${output}\n`;
  };
}
