/*
 * Copyright 2026 Larder Software Limited
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
import { BedrockEmbeddingsParams } from './types';

export class BedrockTitanEmbeddings
  extends Embeddings
  implements BedrockEmbeddingsParams
{
  model: string;

  client: BedrockRuntimeClient;

  constructor(fields?: BedrockEmbeddingsParams) {
    super(fields ?? {});

    this.model = fields?.model ?? 'amazon.titan-embed-text-v1';

    this.client =
      fields?.client ??
      new BedrockRuntimeClient({
        region: fields?.region,
        credentials: fields?.credentials,
      });
  }

  /**
   * Embeds a single text using the Bedrock model.
   * Titan embedding models accept one input text per request.
   * @param text The text to be embedded.
   * @returns A promise that resolves to the embedding.
   * @throws If an error occurs while embedding the text with Bedrock.
   */
  protected async embed(text: string): Promise<number[]> {
    return this.caller.call(async () => {
      try {
        const res = await this.client.send(
          new InvokeModelCommand({
            modelId: this.model,
            body: JSON.stringify({
              inputText: text.replace(/\n/g, ' '),
            }),
            contentType: 'application/json',
            accept: 'application/json',
          }),
        );

        const body = new TextDecoder().decode(res.body);
        return JSON.parse(body).embedding;
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
    return this.embed(document);
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return Promise.all(documents.map(document => this.embed(document)));
  }
}
