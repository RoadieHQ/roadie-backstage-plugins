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
  EntityFilterShape,
  RoadieEmbeddingDoc,
  RoadieEmbeddings,
  RoadieEmbeddingsSource,
  RoadieVectorStore,
} from '@roadiehq/rag-ai-node';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CatalogApi } from '@backstage/catalog-client';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Embeddings } from '@langchain/core/embeddings';
import { Logger } from 'winston';
import { SearchClient } from './SearchClient';
import { SplitterOptions } from './types';

export abstract class RoadieBaseEmbeddings implements RoadieEmbeddings {
  private readonly vectorStore: RoadieVectorStore;
  private readonly catalogApi: CatalogApi;
  private readonly logger: Logger;

  private readonly searchClient?: SearchClient;
  private readonly splitterOptions?: SplitterOptions;

  protected constructor({
    vectorStore,
    catalogApi,
    searchClient,
    logger,
    embeddings,
    splitterOptions,
  }: {
    vectorStore: RoadieVectorStore;
    catalogApi: CatalogApi;
    logger: Logger;
    embeddings: Embeddings;
    splitterOptions?: SplitterOptions;
    searchClient?: SearchClient;
  }) {
    vectorStore.connectEmbeddings(embeddings);
    this.vectorStore = vectorStore;
    this.splitterOptions = splitterOptions;
    this.catalogApi = catalogApi;
    this.searchClient = searchClient;
    this.logger = logger;
  }

  /**
   * Returns the splitter object. Default implementation is using a naive RecursiveCharacterTextSplitter
   * which is likely not the best candidate for structured data splitting.
   *
   * It is recommended that this method is overwritten with more applicable implementation
   *
   * @returns {RecursiveCharacterTextSplitter} The splitter object.
   */
  protected getSplitter() {
    // Defaults to 1000 chars, 200 overlap
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.splitterOptions?.chunkSize,
      chunkOverlap: this.splitterOptions?.chunkOverlap,
    });
    return splitter;
  }

  protected async constructCatalogEmbeddingDocuments(
    entities: Entity[],
    source: RoadieEmbeddingsSource,
  ): Promise<RoadieEmbeddingDoc[]> {
    const splitter = this.getSplitter();
    let docs: RoadieEmbeddingDoc[] = [];
    for (const entity of entities) {
      const splits = await splitter.splitText(JSON.stringify(entity));
      docs = docs.concat(
        splits.map((text: string, idx: number) => ({
          content: text,
          metadata: {
            splitId: idx.toString(),
            source,
            entityRef: stringifyEntityRef(entity),
            kind: entity.kind,
          },
        })),
      );
    }

    return docs;
  }

  protected async getDocuments(
    source: RoadieEmbeddingsSource,
    filter?: EntityFilterShape,
  ) {
    switch (source) {
      case 'catalog': {
        const entitiesResponse = await this.catalogApi.getEntities({
          filter,
        });

        const constructCatalogEmbeddingDocuments =
          await this.constructCatalogEmbeddingDocuments(
            entitiesResponse.items,
            source,
          );
        this.logger.info(
          `Constructed ${constructCatalogEmbeddingDocuments.length} embedding documents for ${entitiesResponse.items.length} catalog items.`,
        );
        return constructCatalogEmbeddingDocuments;
      }
      default:
        throw new Error(
          `Attempting to create embeddings for a source not implemented yet: ${source} `,
        );
    }
  }

  async createEmbeddings(
    source: RoadieEmbeddingsSource,
    filter: EntityFilterShape,
  ): Promise<number> {
    await this.deleteEmbeddings(source, filter);
    const documents = await this.getDocuments(source, filter);
    await this.vectorStore.addDocuments(documents);
    return documents.length;
  }

  async deleteEmbeddings(
    source: RoadieEmbeddingsSource,
    filter: EntityFilterShape,
  ): Promise<void> {
    const entities = (await this.catalogApi.getEntities({ filter })).items.map(
      stringifyEntityRef,
    );

    for (const entityRef of entities) {
      await this.vectorStore.deleteDocuments({
        filter: { source, entityRef },
      });
    }
  }

  async getEmbeddingDocs(
    query: string,
    source: RoadieEmbeddingsSource,
  ): Promise<RoadieEmbeddingDoc[]> {
    const embeddings = await this.vectorStore.similaritySearch(query, {
      source,
    });

    this.logger.info(
      `Received ${embeddings.length} embeddings from Vector store`,
    );

    if (!this.searchClient) {
      return embeddings;
    }

    const queryResults = await this.searchClient.query({
      term: query,
      source: source,
    });

    this.logger.info(
      `Received ${queryResults.length} query results from Backstage search`,
    );

    return embeddings.concat(queryResults);
  }
}
