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
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { Embeddings } from '@langchain/core/embeddings';
import { BedrockEmbeddingsParams } from '@langchain/aws';

export class BedrockCohereEmbeddings
  extends Embeddings
  implements BedrockEmbeddingsParams
{
  model: string;

  client: BedrockRuntimeClient;

  batchSize = 512;

  constructor(fields?: BedrockEmbeddingsParams) {
    super(fields ?? {});

    this.model = fields?.model ?? 'cohere.embed-english-v3';

    this.client =
      fields?.client ??
      new BedrockRuntimeClient({
        region: fields?.region,
        credentials: fields?.credentials,
      });
  }

  /**
   * Embeds an array of documents using the Bedrock model.
   * @param documents The array of documents to be embedded.
   * @param inputType The input type for the embedding process.
   * @returns A promise that resolves to a 2D array of embeddings.
   * @throws If an error occurs while embedding documents with Bedrock.
   */
  protected async embed(
    documents: string[],
    inputType: string,
  ): Promise<number[][]> {
    return this.caller.call(async () => {
      const batchSize = 66; // Max 66 documents per batch
      const batches = [];

      for (let i = 0; i < documents.length; i += batchSize) {
        batches.push(documents.slice(i, i + batchSize));
      }

      const results: number[][] = [];

      try {
        for (const batch of batches) {
          const res = await this.client.send(
            new InvokeModelCommand({
              modelId: this.model,
              body: JSON.stringify({
                texts: batch.map(doc => doc.replace(/\n+/g, ' ')),
                input_type: inputType,
              }),
              contentType: 'application/json',
              accept: 'application/json',
            }),
          );

          const body = new TextDecoder().decode(res.body);
          const embeddings = JSON.parse(body).embeddings;
          results.push(...embeddings);
        }

        return results;
      } catch (e) {
        console.error({
          error: e,
        });
        if (e instanceof Error) {
          throw new Error(
            `An error occurred while embedding documents with Bedrock: ${e.message}`,
          );
        }

        throw new Error(
          'An error occurred while embedding documents with Bedrock',
        );
      }
    });
  }

  async embedQuery(document: string): Promise<number[]> {
    return this.embed([document], 'search_query').then(
      embeddings => embeddings[0],
    );
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return this.embed(documents, 'search_document');
  }
}
