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
import { BedrockTitanEmbeddings } from './BedrockTitanEmbeddings';

const responseFor = (embedding: number[]) => ({
  body: new TextEncoder().encode(JSON.stringify({ embedding })),
});

describe('BedrockTitanEmbeddings', () => {
  let send: jest.Mock;
  let embeddings: BedrockTitanEmbeddings;

  beforeEach(() => {
    send = jest.fn();
    embeddings = new BedrockTitanEmbeddings({
      client: { send } as unknown as BedrockRuntimeClient,
      maxRetries: 0,
    });
  });

  it('defaults to the Titan text embeddings model', () => {
    expect(embeddings.model).toBe('amazon.titan-embed-text-v1');
  });

  it('embeds a query with a single InvokeModel request', async () => {
    send.mockResolvedValueOnce(responseFor([0.1, 0.2]));

    await expect(embeddings.embedQuery('line one\nline two')).resolves.toEqual([
      0.1, 0.2,
    ]);

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0] as InvokeModelCommand;
    expect(command.input).toEqual({
      modelId: 'amazon.titan-embed-text-v1',
      body: JSON.stringify({ inputText: 'line one line two' }),
      contentType: 'application/json',
      accept: 'application/json',
    });
  });

  it('embeds each document with its own request, preserving order', async () => {
    send
      .mockResolvedValueOnce(responseFor([1]))
      .mockResolvedValueOnce(responseFor([2]));

    await expect(embeddings.embedDocuments(['a', 'b'])).resolves.toEqual([
      [1],
      [2],
    ]);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('wraps Bedrock errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    send.mockRejectedValueOnce(new Error('throttled'));

    await expect(embeddings.embedQuery('a')).rejects.toThrow(
      'An error occurred while embedding documents with Bedrock: throttled',
    );
  });
});
