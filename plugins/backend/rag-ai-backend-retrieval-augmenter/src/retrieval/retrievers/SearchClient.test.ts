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
import { SearchClient, SearchClientQuery } from './SearchClient';
import {
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { EmbeddingsSource } from '@roadiehq/rag-ai-node';

describe('SearchClient', () => {
  let mockDiscoveryApi: PluginEndpointDiscovery;
  let mockTokenManager: TokenManager;
  let mockLogger: any;
  let searchClient: SearchClient;

  beforeEach(() => {
    mockDiscoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue('http://mock-search-url'),
      getExternalBaseUrl: jest.fn(),
    };
    mockTokenManager = {
      getToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
      authenticate: jest.fn(),
    };
    mockLogger = {
      warn: jest.fn(),
    };

    searchClient = new SearchClient({
      discoveryApi: mockDiscoveryApi,
      tokenManager: mockTokenManager,
      logger: mockLogger,
    });
  });

  it('should create a SearchClient with the correct constructor parameters', () => {
    expect(searchClient).toBeDefined();
    expect(searchClient).toBeInstanceOf(SearchClient);
  });

  it('should set correct authorization header in query search method', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ results: [] }),
    } as unknown as Response;

    const mockFetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(mockResponse);

    const query: SearchClientQuery = {
      term: 'catalog',
      source: 'catalog' as EmbeddingsSource,
    };

    await searchClient.query(query);

    expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalled();
    expect(mockTokenManager.getToken).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://mock-search-url/query?term=catalog&types[0]=software-catalog',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      },
    );
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });
});
