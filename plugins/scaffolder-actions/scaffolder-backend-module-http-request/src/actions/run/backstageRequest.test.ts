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
import { Config, ConfigReader } from '@backstage/config';
import os from 'os'; // eslint-disable-line
import { getVoidLogger } from '@backstage/backend-common';
import { PassThrough } from 'stream'; // eslint-disable-line
import { createHttpBackstageAction } from './backstageRequest';
import fetch from 'cross-fetch';

jest.mock('cross-fetch');
const fetchMock = fetch as jest.MockedFunction<typeof fetch>;
const headers = new Headers({
  'Content-Type': 'application/json',
  Accept: '*/*',
});

const returnBody: any = {
  foo: 'bar',
};

const mockResponse = {
  ok: true,
  status: 200,
  headers,
  json: () => {
    return returnBody;
  },
  text: async () => {
    return JSON.stringify(returnBody) as string;
  },
} as Response;

describe('http:backstage:request', () => {
  let config: Config;
  let action: any;
  const mockBaseUrl = 'http://backstage.tests';
  const logger = getVoidLogger();

  beforeEach(() => {
    jest.resetAllMocks();
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
    action = createHttpBackstageAction({ config });
  });

  const mockContext = {
    workspacePath: os.tmpdir(),
    logger: logger,
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  describe('when the action runs correctly', () => {
    describe('with path simple request', () => {
      it('should create a request and add baseurl of app', async () => {
        fetchMock.mockResolvedValue(Promise.resolve(mockResponse));
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
          },
        });
        expect(fetchMock).toBeCalledWith('http://backstage.tests/api/proxy/foo',
          expect.objectContaining({
            method: 'GET',
            headers: {},
          })
        );
      });
    });

    describe('with body defined as application/json', () => {
      it('should create a request and pass body parameter', async () => {
        fetchMock.mockResolvedValue(Promise.resolve(mockResponse));
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: {
              name: 'test',
            },
          },
        });
        expect(fetchMock).toBeCalledWith('http://backstage.tests/api/proxy/foo',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: '{"name":"test"}',
          })
        );
      });
    });

    describe('with body defined as a string', () => {
      it('should create a request and pass body parameter', async () => {
        fetchMock.mockResolvedValue(Promise.resolve(mockResponse));

        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: 'test',
          },
        });
        expect(fetchMock).toBeCalledWith('http://backstage.tests/api/proxy/foo',
          expect.objectContaining({
            method: 'POST',
            headers: {},
            body: 'test',
          })
        );
      });
    });

    describe('with body undefined', () => {
      it('should create a request and body should be undefined', async () => {
        fetchMock.mockResolvedValue(Promise.resolve(mockResponse));

        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
          },
        });
        expect(fetchMock).toBeCalledWith('http://backstage.tests/api/proxy/foo',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: undefined,
          })
        );
      });
    });

    describe('with a token request', () => {
      it('should create a request', async () => {
        fetchMock.mockResolvedValue(Promise.resolve(mockResponse));

        await action.handler({
          ...mockContext,
          secrets: { backstageToken: 'some-token' },
          input: {
            path: `/api/proxy/foo`,
            method: 'GET',
          },
        });
        expect(fetchMock).toBeCalledWith(`${mockBaseUrl}/api/proxy/foo`,
          expect.objectContaining({
            method: 'GET',
            headers: {
              authorization: 'Bearer some-token',
            },
          })
        );
      });
    });

    describe('if I pass my own authorizer', () => {
      it('should create a request', async () => {
        fetchMock.mockResolvedValue(Promise.resolve(mockResponse));
        action = createHttpBackstageAction({ config, authorizerFactory: (ctx) => {
            return (request) => {
              request.headers = request.headers as {}
              const token = ctx.secrets?.backstageToken?.split('').reverse().join('');
              request.headers.authorization = `Bearer ${token}`
              return request;
            }
          }
        });

        await action.handler({
          ...mockContext,
          secrets: { backstageToken: 'some-token' },
          input: {
            path: `/api/proxy/foo`,
            method: 'GET',
          },
        });
        expect(fetchMock).toBeCalledWith(`${mockBaseUrl}/api/proxy/foo`,
            expect.objectContaining({
              method: 'GET',
              headers: {
                authorization: 'Bearer nekot-emos',
              },
            })
        );
      });
    });
  });

  describe("when the action doesn't run correctly", () => {
    describe('with no proxy path', () => {
      it('fails to run', async () => {
        config = new ConfigReader({});
        action = createHttpBackstageAction({ config });
        await expect(
          async () =>
            await action.handler({
              ...mockContext,
              input: {
                path: '/api/path',
                method: 'GET',
              },
            }),
        ).rejects.toThrowError('Unable to get base url');
      });
    });
  });
});
