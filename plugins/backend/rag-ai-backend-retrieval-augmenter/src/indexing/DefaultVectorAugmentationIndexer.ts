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

import { TokenManager } from '@backstage/backend-common';
import { CATALOG_FILTER_EXISTS, CatalogApi } from '@backstage/catalog-client';
import { Logger } from 'winston';
import { SearchIndex, SplitterOptions } from './types';
import { Embeddings } from '@langchain/core/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  AugmentationIndexer,
  EmbeddingDoc,
  EmbeddingsSource,
  EntityFilterShape,
  RoadieVectorStore,
} from '@roadiehq/rag-ai-node';
import { DiscoveryService } from '@backstage/backend-plugin-api';

export class DefaultVectorAugmentationIndexer implements AugmentationIndexer {
  private readonly _vectorStore: RoadieVectorStore;
  private readonly catalogApi: CatalogApi;
  private readonly logger: Logger;
  private readonly tokenManager: TokenManager;
  private readonly discovery: DiscoveryService;

  private readonly splitterOptions?: SplitterOptions;

  protected constructor({
    vectorStore,
    catalogApi,
    logger,
    tokenManager,
    embeddings,
    discovery,
    splitterOptions,
  }: {
    vectorStore: RoadieVectorStore;
    catalogApi: CatalogApi;
    logger: Logger;
    tokenManager: TokenManager;
    embeddings: Embeddings;
    discovery: DiscoveryService;
    splitterOptions?: SplitterOptions;
  }) {
    vectorStore.connectEmbeddings(embeddings);
    this._vectorStore = vectorStore;
    this.splitterOptions = splitterOptions;
    this.catalogApi = catalogApi;
    this.logger = logger;
    this.tokenManager = tokenManager;
    this.discovery = discovery;
  }

  get vectorStore() {
    return this._vectorStore;
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
    return new RecursiveCharacterTextSplitter({
      chunkSize: this.splitterOptions?.chunkSize,
      chunkOverlap: this.splitterOptions?.chunkOverlap,
    });
  }

  protected async constructCatalogEmbeddingDocuments(
    entities: Entity[],
    source: EmbeddingsSource,
  ): Promise<EmbeddingDoc[]> {
    const splitter = this.getSplitter();
    let docs: EmbeddingDoc[] = [];
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

  protected async constructTechDocsEmbeddingDocuments(
    texts: string[],
    source: EmbeddingsSource,
  ): Promise<EmbeddingDoc[]> {
    const splitter = this.getSplitter();
    let docs: EmbeddingDoc[] = [];
    for (const text of texts) {
      const splits = await splitter.splitText(text);
      docs = docs.concat(
        splits.map((content: string, idx: number) => ({
          content,
          metadata: {
            splitId: idx.toString(),
            source,
          },
        })),
      );
    }

    return docs;
  }

  protected async getDocuments(
    source: EmbeddingsSource,
    filter?: EntityFilterShape,
  ) {
    switch (source) {
      case 'catalog': {
        const { token } = await this.tokenManager.getToken();

        const entitiesResponse = await this.catalogApi.getEntities(
          { filter },
          { token },
        );

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
      case 'tech-docs': {
        const { token } = await this.tokenManager.getToken();

        const entitiesResponse = await this.catalogApi.getEntities(
          {
            filter: {
              'metadata.annotations.backstage.io/techdocs-ref':
                CATALOG_FILTER_EXISTS,
            },
          },
          { token },
        );

        const techDocsBaseUrl = await this.discovery.getBaseUrl('techdocs');

        const textsPromises = entitiesResponse.items.map(async entity => {
          const { kind } = entity;
          const { namespace = 'default', name } = entity.metadata;

          const searchIndexUrl = `${techDocsBaseUrl}/static/docs/${namespace}/${kind}/${name}/search/search_index.json`;

          try {
            const searchIndexResponse = await fetch(searchIndexUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const searchIndex =
              (await searchIndexResponse.json()) as SearchIndex;

            return searchIndex.docs.map(doc => doc.text);
          } catch (e) {
            this.logger.debug(
              `Failed to retrieve tech docs search index for entity ${namespace}/${kind}/${name}`,
              e,
            );
            return [];
          }
        });

        const texts = (await Promise.all(textsPromises)).flat();

        const constructTechDocsEmbeddingDocuments =
          await this.constructTechDocsEmbeddingDocuments(texts, source);

        this.logger.info(
          `Constructed ${constructTechDocsEmbeddingDocuments.length} embedding documents for ${entitiesResponse.items.length} TechDocs.`,
        );
        return constructTechDocsEmbeddingDocuments;
      }
      default:
        throw new Error(
          `Attempting to create embeddings for a source not implemented yet: ${source} `,
        );
    }
  }

  async createEmbeddings(
    source: EmbeddingsSource,
    filter: EntityFilterShape,
  ): Promise<number> {
    await this.deleteEmbeddings(source, filter);
    const documents = await this.getDocuments(source, filter);
    await this._vectorStore.addDocuments(documents);
    return documents.length;
  }

  async deleteEmbeddings(
    source: EmbeddingsSource,
    filter: EntityFilterShape,
  ): Promise<void> {
    const { token } = await this.tokenManager.getToken();

    const entities = (
      await this.catalogApi.getEntities({ filter }, { token })
    ).items.map(stringifyEntityRef);

    for (const entityRef of entities) {
      await this._vectorStore.deleteDocuments({
        filter: { source, entityRef },
      });
    }
  }
}
