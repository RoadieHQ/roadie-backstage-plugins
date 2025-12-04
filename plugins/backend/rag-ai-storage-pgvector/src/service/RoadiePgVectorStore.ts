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
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  EmbeddingDocMetadata,
  EmbeddingDoc,
  RoadieVectorStore,
} from '@roadiehq/rag-ai-node';
import { Embeddings } from '@langchain/core/embeddings';
import { Knex } from 'knex';

export interface RoadiePgVectorStoreConfig {
  logger: LoggerService;
  db: Knex;
  /**
   * The amount of documents to chunk by when
   * adding vectors.
   * @default 500
   */
  chunkSize?: number;

  /**
   * The default amount of embeddings to return when querying vectors with similarity search
   */
  amount?: number;
}

/**
 * A class representing a vector store that uses PostgreSQL as the backend.
 */
export class RoadiePgVectorStore implements RoadieVectorStore {
  protected readonly tableName: string = 'embeddings';
  protected readonly client: Knex;
  protected readonly chunkSize;
  protected readonly amount;
  protected embeddings?: Embeddings;
  protected readonly logger: LoggerService;

  /**
   * Initializes the RoadiePgVectorStore.
   *
   * @param {RoadiePgVectorStoreConfig} config - The configuration for RoadiePgVectorStore.
   *
   * @return {Promise<RoadiePgVectorStore>} A Promise that resolves to an instance of RoadiePgVectorStore.
   */
  static async initialize(
    config: RoadiePgVectorStoreConfig,
  ): Promise<RoadiePgVectorStore> {
    return new RoadiePgVectorStore(config);
  }

  /**
   * Constructor for RoadiePgVectorStore class.
   *
   * @param {RoadiePgVectorStoreConfig} config - The configuration object for RoadiePgVectorStore.
   * @param {string} config.db - The database client to connect.
   * @param {Object} config.logger - The logger object for logging.
   * @param {number} [config.chunkSize=500] - The size of chunks for processing.
   */
  protected constructor(config: RoadiePgVectorStoreConfig) {
    this.client = config.db;
    this.logger = config.logger;
    this.chunkSize = config.chunkSize ?? 500;
    this.amount = config.amount ?? 4;
  }

  connectEmbeddings(embeddings: Embeddings) {
    this.embeddings = embeddings;
  }

  table() {
    return this.client('embeddings');
  }

  /**
   * Add documents to the vector store.
   *
   * @param {EmbeddingDoc[]} documents - The array of documents to be added.
   * @throws {Error} When no embeddings are configured for the vector store.
   * @returns {Promise<void>} Resolves when the documents have been added successfully.
   */
  async addDocuments(documents: EmbeddingDoc[]): Promise<void> {
    const texts = documents.map(({ content }) => content);
    if (!this.embeddings) {
      throw new Error('No Embeddings configured for the vector store.');
    }

    const vectors = await this.embeddings.embedDocuments(texts);
    this.logger.info(
      `Received ${vectors.length} vectors from embeddings creation.`,
    );
    return this.addVectors(vectors, documents);
  }

  /**
   * Adds vectors to the database along with corresponding documents.
   *
   * @param {number[][]} vectors - The vectors to be added.
   * @param {EmbeddingDoc[]} documents - The corresponding documents.
   * @return {Promise<void>} - A promise that resolves when the vectors are added successfully.
   * @throws {Error} - If there is an error inserting the vectors.
   */
  protected async addVectors(
    vectors: number[][],
    documents: EmbeddingDoc[],
  ): Promise<void> {
    try {
      const rows = [];
      for (let i = 0; i < vectors.length; i += 1) {
        const embedding = vectors[i];
        const embeddingString = `[${embedding.join(',')}]`;
        const values = {
          content: documents[i].content.replace(/\0/g, ''),
          vector: embeddingString.replace(/\0/g, ''),
          metadata: documents[i].metadata,
        };
        rows.push(values);
      }

      await this.client.batchInsert(this.tableName, rows, this.chunkSize);
    } catch (e) {
      this.logger.error((e as Error).message);
      throw new Error(`Error inserting: ${(e as Error).message}`);
    }
  }

  /**
   * Deletes records from the database table by their ids.
   *
   * @param {string[]} ids - The array of ids of the records to be deleted.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   */
  protected async deleteById(ids: string[]) {
    await this.table().delete().whereIn('id', ids);
  }

  /**
   * Deletes rows from the table based on the specified filter.
   *
   * @param {EmbeddingDocMetadata} filter - The filter to apply for deletion.
   * @returns {Promise} - A Promise that resolves when the deletion is complete.
   */
  protected async deleteByFilter(filter: EmbeddingDocMetadata) {
    const queryString = `
      DELETE FROM ${this.tableName}
      WHERE metadata::jsonb @> :filter
    `;
    return this.client.raw(queryString, { filter });
  }

  /**
   * Deletes documents based on the provided deletion parameters.
   * Either `ids` or `filter` must be specified.
   *
   * @param {Object} deletionParams - The deletion parameters.
   * @param {Array<string>} [deletionParams.ids] - The document IDs to delete.
   * @param {EmbeddingDocMetadata} [deletionParams.filter] - The filter to match documents to be deleted.
   *
   * @return {Promise<void>} - A Promise that resolves once the documents have been deleted.
   */
  async deleteDocuments(deletionParams: {
    ids?: string[];
    filter?: EmbeddingDocMetadata;
  }): Promise<void> {
    const { ids, filter } = deletionParams;

    if (!(ids || filter)) {
      throw new Error(
        'You must specify either ids or a filter when deleting documents.',
      );
    }

    if (ids && filter) {
      throw new Error(
        'You cannot specify both ids and a filter when deleting documents.',
      );
    }

    if (ids) {
      await this.deleteById(ids);
    } else if (filter) {
      await this.deleteByFilter(filter);
    }
  }

  /**
   * Finds the most similar documents to a given query vector, along with their similarity scores.
   *
   * @param {number[]} query - The query vector to compare against.
   * @param {number} amount - The maximum number of results to return.
   * @param {EmbeddingDocMetadata} [filter] - Optional filter to limit the search results.
   * @returns {Promise<[EmbeddingDoc, number][]>} - An array of document similarity results, where each
   * result is a tuple containing the document and its similarity score.
   */
  protected async similaritySearchVectorWithScore(
    query: number[],
    amount: number,
    filter?: EmbeddingDocMetadata,
  ): Promise<[EmbeddingDoc, number][]> {
    const embeddingString = `[${query.join(',')}]`;
    const queryString = `
      SELECT *, vector <=> :embeddingString as "_distance"
      FROM ${this.tableName}
      WHERE metadata::jsonb @> :filter
      ORDER BY "_distance" ASC
      LIMIT :amount
    `;

    const documents = (
      await this.client.raw(queryString, {
        embeddingString,
        filter: JSON.stringify(filter ?? {}),
        amount,
      })
    ).rows;

    const results = [] as [EmbeddingDoc, number][];
    for (const doc of documents) {
      // eslint-ignore-next-line
      if (doc._distance != null && doc.content != null) {
        const document = {
          content: doc.content,
          metadata: doc.metadata,
        };
        results.push([document, doc._distance]);
      }
    }
    return results;
  }

  /**
   * Performs a similarity search using the given query and filter.
   *
   * @param {string} query - The query to perform the similarity search on.
   * @param {EmbeddingDocMetadata} filter - The filter to apply to the search results.
   * @param {number} [amount=4] - The number of results to return.
   * @return {Promise<EmbeddingDoc[]>} - A promise that resolves to an array of RoadieEmbeddingDoc objects representing the search results.
   * @throws {Error} - Throws an error if there are no embeddings configured for the vector store.
   */
  async similaritySearch(
    query: string,
    filter: EmbeddingDocMetadata,
    amount: number = this.amount,
  ): Promise<EmbeddingDoc[]> {
    if (!this.embeddings) {
      throw new Error('No Embeddings configured for the vector store.');
    }
    const results = await this.similaritySearchVectorWithScore(
      await this.embeddings.embedQuery(query),
      amount,
      filter,
    );

    return results.map(result => result[0]);
  }
}
