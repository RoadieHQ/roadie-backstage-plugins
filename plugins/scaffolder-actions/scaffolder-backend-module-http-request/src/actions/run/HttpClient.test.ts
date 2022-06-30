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
import { getRootLogger } from '@backstage/backend-common';
import { Writable } from 'stream';
import * as winston from "winston";
import { HttpBackstageRequestAuthorizer, HttpClient } from './HttpClient';

let mockResponse: Response;

const status = 200;
const returnBody: any = {
    foo: 'bar',
};

const url = 'https://some-mock-url.com';

// We add a transport to the winston logger so that we can assert the log contents using the stream below
let logOutput = ''
const logStream = new Writable()
logStream._write = (chunk, _encoding, next) => {
    logOutput = logOutput += chunk.toString()
    next()
}
const streamTransport = new winston.transports.Stream({ stream: logStream })
const logger = getRootLogger();
logger.add(streamTransport)
import fetch from 'cross-fetch';

const fetchMock = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('cross-fetch');

const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: '*/*',
});

const authorizer: HttpBackstageRequestAuthorizer = (request) => {
    return request;
}

describe('HttpClient', () => {
    describe('#request', () => {
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
                    fetchMock.mockResolvedValue(
                        Promise.resolve(mockResponse),
                    );
                    const response = await new HttpClient({ logger, authorizer }).request(url, {});
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

                    fetchMock.mockResolvedValue(
                        Promise.resolve(mockedResponse),
                    );
                    const response = await new HttpClient({ logger, authorizer }).request(url, {});
                    expect(response.code).toEqual(200);
                    expect(await response.body).toEqual({ message: 'Hello!' });
                });
            });
        });

        describe('when the requests are bad', () => {
            describe("when there's an error while fetching", () => {
                it('fails with an error', async () => {
                    fetchMock.mockImplementation(() => {
                        throw new Error('fetch error');
                    });
                    await expect(
                        async () => await new HttpClient({ logger, authorizer }).request(url, {}),
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
                        json: async () => ({
                            error: "bad request"
                        })
                    };

                    fetchMock.mockResolvedValue(
                        Promise.resolve(mockedResponse),
                    );
                    await expect(
                        async () => await new HttpClient({ logger, authorizer }).request(url, {}),
                    ).rejects.toThrowError('Unable to complete request');

                    const logEvents = logOutput.trim().split('\n')
                    expect(logEvents).toEqual(
                        expect.arrayContaining([
                            expect.stringContaining(
                                `"error":"bad request"`
                            )
                        ])
                    )
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

                    fetchMock.mockResolvedValue(
                        Promise.resolve(mockedResponse),
                    );
                    await expect(
                        async () => await new HttpClient({ logger, authorizer }).request(url, {}),
                    ).rejects.toThrowError(
                        'Could not get response: Error: Unable to get JSON',
                    );
                });
            });

            describe("when the request timesout", () => {
                it('fails with an error', async () => {
                    fetchMock.mockResolvedValue(new AbortController().abort() as unknown as Response);
                    await expect(
                        async () => await new HttpClient({ logger, authorizer }).request(url, {}),
                    ).rejects.toThrowError(
                        'There was an issue with the request: Error: Request was aborted as it took longer than 60 seconds',
                    );
                });
            });
        });
    });
});
