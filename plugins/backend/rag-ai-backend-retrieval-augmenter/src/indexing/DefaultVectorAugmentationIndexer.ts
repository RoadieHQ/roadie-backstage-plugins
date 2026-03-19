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
  createLegacyAuthAdapters,
  TokenManager,
} from '@backstage/backend-common';
import { CATALOG_FILTER_EXISTS, CatalogApi } from '@backstage/catalog-client';
import { SearchIndex, AugmentationOptions, TechDocsDocument } from './types';
import { Embeddings } from '@langchain/core/embeddings';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  AugmentationIndexer,
  EmbeddingDoc,
  EmbeddingsSource,
  EntityFilterShape,
  RoadieVectorStore,
} from '@roadiehq/rag-ai-node';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import pLimit from 'p-limit';

const TECHDOCS_ENTITY_FILTER = {
  'metadata.annotations.backstage.io/techdocs-ref': CATALOG_FILTER_EXISTS,
};

export class DefaultVectorAugmentationIndexer implements AugmentationIndexer {
  private readonly _vectorStore: RoadieVectorStore;
  private readonly catalogApi: CatalogApi;
  private readonly logger: LoggerService;
  private readonly auth: AuthService;
  private readonly discovery: DiscoveryService;

  private readonly augmentationOptions?: AugmentationOptions;

  protected constructor({
    vectorStore,
    catalogApi,
    logger,
    auth,
    tokenManager,
    embeddings,
    discovery,
    augmentationOptions,
  }: {
    vectorStore: RoadieVectorStore;
    catalogApi: CatalogApi;
    logger: LoggerService;
    auth?: AuthService;
    tokenManager?: TokenManager;
    embeddings: Embeddings;
    discovery: DiscoveryService;
    augmentationOptions?: AugmentationOptions;
  }) {
    vectorStore.connectEmbeddings(embeddings);
    this._vectorStore = vectorStore;
    this.augmentationOptions = augmentationOptions;
    this.catalogApi = catalogApi;
    this.logger = logger;
    this.auth = createLegacyAuthAdapters({
      auth,
      discovery,
      tokenManager,
    }).auth;
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
      chunkSize: this.augmentationOptions?.chunkSize,
      chunkOverlap: this.augmentationOptions?.chunkOverlap,
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
    documents: TechDocsDocument[],
    source: EmbeddingsSource,
  ): Promise<EmbeddingDoc[]> {
    const splitter = this.getSplitter();
    let docs: EmbeddingDoc[] = [];
    for (const { text, entity, title, location } of documents) {
      const splits = await splitter.splitText(text);
      docs = docs.concat(
        splits.map((content: string, idx: number) => ({
          content,
          metadata: {
            splitId: idx.toString(),
            source,
            entityRef: stringifyEntityRef(entity),
            kind: entity.kind,
            title,
            location,
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
    const limit = pLimit(this.augmentationOptions?.concurrencyLimit ?? 10);

    switch (source) {
      case 'catalog': {
        const { token } = await this.auth.getPluginRequestToken({
          onBehalfOf: await this.auth.getOwnServiceCredentials(),
          targetPluginId: 'catalog',
        });

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
        const { token } = await this.auth.getPluginRequestToken({
          onBehalfOf: await this.auth.getOwnServiceCredentials(),
          targetPluginId: 'catalog',
        });

        const entitiesResponse = await this.catalogApi.getEntities(
          {
            filter: { ...TECHDOCS_ENTITY_FILTER, ...filter },
          },
          { token },
        );

        const techDocsBaseUrl = await this.discovery.getBaseUrl('techdocs');

        const documentsPromises = entitiesResponse.items.map(entity =>
          limit(async () => {
            const { kind } = entity;
            const { namespace = 'default', name } = entity.metadata;

            const searchIndexUrl = `${techDocsBaseUrl}/static/docs/${namespace}/${kind}/${name}/search/search_index.json`;

            try {
              const { token: techDocsToken } =
                await this.auth.getPluginRequestToken({
                  onBehalfOf: await this.auth.getOwnServiceCredentials(),
                  targetPluginId: 'techdocs',
                });

              const searchIndexResponse = await fetch(searchIndexUrl, {
                headers: {
                  Authorization: `Bearer ${techDocsToken}`,
                },
              });

              const searchIndex =
                (await searchIndexResponse.json()) as SearchIndex;

              return searchIndex.docs.reduce<TechDocsDocument[]>((acc, doc) => {
                // only filter sections that contain text
                if (doc.location.includes('#') && doc.text)
                  acc.push({
                    ...doc,
                    entity,
                  });

                return acc;
              }, []);
            } catch (e) {
              this.logger.debug(
                `Failed to retrieve tech docs search index for entity ${namespace}/${kind}/${name}`,
                e as Error,
              );
              return [];
            }
          }),
        );

        const documents = (await Promise.all(documentsPromises)).flat();

        const constructTechDocsEmbeddingDocuments =
          await this.constructTechDocsEmbeddingDocuments(documents, source);

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
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    const entityFilter =
      source === 'tech-docs'
        ? { ...TECHDOCS_ENTITY_FILTER, ...filter }
        : filter;
    const entities = (
      await this.catalogApi.getEntities({ filter: entityFilter }, { token })
    ).items.map(stringifyEntityRef);

    for (const entityRef of entities) {
      await this._vectorStore.deleteDocuments({
        filter: { source, entityRef },
      });
    }
  }
}
