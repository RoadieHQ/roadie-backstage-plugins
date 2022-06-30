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
import { generateBackstageUrl } from './helpers';
import { Config, ConfigReader } from '@backstage/config';
import { getRootLogger } from '@backstage/backend-common';
import { Writable } from 'stream';
import * as winston from "winston";

const mockBaseUrl = 'http://backstage.tests';

let config: Config;
let url = 'https://some-mock-url.com';
const proxyPath = '/api/proxy/foo';

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

jest.mock('cross-fetch');

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
});
