/*
 * Copyright 2021 Larder Software Limited
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
import { generateBackstageUrl, http } from './helpers';
import { HttpOptions } from './types';
import { Config, ConfigReader } from '@backstage/config';
import { getVoidLogger } from '@backstage/backend-common';

const mockBaseUrl = 'http://backstage.tests';

let mockResponse: Response;
let config: Config;
let url = 'https://some-mock-url.com';
const proxyPath = '/api/proxy/foo';

const status = 200;
const returnBody: any = {
  foo: 'bar',
};

const options: HttpOptions = {
  method: 'GET',
  url,
  headers: {},
};
const logger = getVoidLogger();

jest.mock('cross-fetch');
import fetch from 'cross-fetch';

const headers = new Headers({
  'Content-Type': 'application/json',
  Accept: '*/*',
});

describe('http', () => {
  describe('#generateProxyUrl', () => {
    beforeEach(() => {
      config = new ConfigReader({
        app: {
          baseUrl: mockBaseUrl,
        },
        backend: {
          baseUrl: mockBaseUrl,
          listen: {
            port: 7007,
          },
        },
      });
      url = `${mockBaseUrl}/api/proxy/foo`;
    });

    describe('with happy path proxy configuration', () => {
      describe('with valid path', () => {
        it('returns the same url as passed in', async () => {
          expect(await generateBackstageUrl(config, proxyPath)).toEqual(
            `${mockBaseUrl}/api/proxy/foo`,
          );
        });
      });
    });

    describe('with non happy path', () => {
      describe('when the configuration is incorrect', () => {
        it('fails', async () => {
          config = new ConfigReader({});
          await expect(
            async () => await generateBackstageUrl(config, url),
          ).rejects.toThrowError('Unable to get base url');
        });
      });
    });
  });

  describe('#http', () => {
    beforeEach(() => {
      mockResponse = {
        ok: true,
        status,
        headers,
        json: () => {
          return returnBody;
        },
        text: async () => {
          return JSON.stringify(returnBody) as string;
        },
      } as Response;
    });
    describe('when the requests are good', () => {
      describe('Getting JSON', () => {
        it('returns a good response', async () => {
          ((fetch as unknown) as jest.Mock).mockResolvedValue(
            Promise.resolve(mockResponse),
          );
          const response = await http(options, logger);
          expect(response.code).toEqual(200);
          expect(await response.body).toEqual(returnBody);
        });
      });

      describe('Getting Text', () => {
        it('returns a good response', async () => {
          const mockedResponse: Response = {
            ...mockResponse,
            headers:new Headers({
              'Content-Type': 'plain/text',
            }),
            text : async () => {
              return 'Hello!';
            },
          };

          ((fetch as unknown) as jest.Mock).mockResolvedValue(
            Promise.resolve(mockedResponse),
          );
          const response = await http(options, logger);
          expect(response.code).toEqual(200);
          expect(await response.body).toEqual({ message: 'Hello!' });
        });
      });
    });

    describe('when the requests are bad', () => {
      describe("when there's an error while fetching", () => {
        it('fails with an error', async () => {
          ((fetch as unknown) as jest.Mock).mockImplementation(() => {
            throw new Error('fetch error');
          });
          await expect(
            async () => await http(options, logger),
          ).rejects.toThrowError(
            'There was an issue with the request: Error: fetch error',
          );
        });
      });

      describe("when there's a status code >= 400", () => {
        it('fails with an error', async () => {
          const mockedResponse: Response = {
            ...mockResponse,
            ok: false,
            status: 401,
          };
           
          ((fetch as unknown) as jest.Mock).mockResolvedValue(
            Promise.resolve(mockedResponse),
          );
          await expect(
            async () => await http(options, logger),
          ).rejects.toThrowError('Unable to complete request');
        });
      });

      describe("when there's an error while retrieving json", () => {
        it('fails with an error', async () => {
          const mockedResponse: Response = {
            ...mockResponse,
            json:  () => {
              throw new Error('Unable to get JSON');
            }
          };

          ((fetch as unknown) as jest.Mock).mockResolvedValue(
            Promise.resolve(mockedResponse),
          );
          await expect(
            async () => await http(options, logger),
          ).rejects.toThrowError(
            'Could not get response: Error: Unable to get JSON',
          );
        });
      });
    });
  });
});
