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
import { createHttpBackstageAction } from './backstageRequest';
import os from 'os'; // eslint-disable-line
import { mockServices } from '@backstage/backend-test-utils';
import { PassThrough } from 'stream'; // eslint-disable-line
import { http } from './helpers';
import { UrlPatternDiscovery } from '@backstage/core-app-api';

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers.ts'),
  http: jest.fn(),
}));

describe('http:backstage:request', () => {
  let action: any;
  const mockBaseUrl = 'http://backstage.tests';
  const logger = mockServices.logger.mock();
  const discovery = UrlPatternDiscovery.compile(`${mockBaseUrl}/{{pluginId}}`);

  beforeEach(() => {
    jest.resetAllMocks();
    action = createHttpBackstageAction({ discovery });
  });

  const mockContext = {
    workspacePath: os.tmpdir(),
    logger: logger,
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    isDryRun: false,
  };

  describe('when the action runs correctly', () => {
    describe('with path simple request', () => {
      it('should create a request and add baseurl of app', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            headers: {},
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as application/json', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
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
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: '{"name":"test"}',
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as application/json and passing a string', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              name: 'test',
            }),
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: '{"name":"test"}',
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as a string', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: 'test',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {},
            body: 'test',
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as a string xml', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: '<?xml version="1.0" encoding="UTF-8"><node>asdf</node>',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {},
            body: '<?xml version="1.0" encoding="UTF-8"><node>asdf</node>',
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as application/json and passing an array', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify([
              {
                name: 'test',
              },
            ]),
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: '[{"name":"test"}]',
          },
          logger,
          false,
        );
      });
    });

    describe('with authorization header', () => {
      const BACKSTAGE_TOKEN = 'BACKSTAGE_TOKEN';
      it('should create a request and pass backstage token as authorization header', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          secrets: {
            backstageToken: BACKSTAGE_TOKEN,
          },
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: 'test',
            headers: {},
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              authorization: `Bearer ${BACKSTAGE_TOKEN}`,
            },
            body: 'test',
          },
          logger,
          false,
        );
      });

      it('should create a request and pass custom authorization header from input', async () => {
        const HEADERS = {
          Authorization: '123',
          Test: 'some-test',
        };

        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          secrets: {
            backstageToken: BACKSTAGE_TOKEN,
          },
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: 'test',
            headers: HEADERS,
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: HEADERS,
            body: 'test',
          },
          logger,
          false,
        );
      });
    });

    describe('with body undefined', () => {
      it('should create a request and body should be undefined', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
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
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: undefined,
          },
          logger,
          false,
        );
      });
    });

    describe('with a token request', () => {
      it('should create a request', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          secrets: { backstageToken: 'some-token' },
          input: {
            path: `/api/proxy/foo`,
            method: 'GET',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: `${mockBaseUrl}/api/proxy/foo`,
            method: 'GET',
            headers: {
              authorization: 'Bearer some-token',
            },
          },
          logger,
          false,
        );
      });
    });

    describe('with logging enabled', () => {
      it('should create a request with logging', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        const expectedLog =
          'Creating GET request with http:backstage:request scaffolder action against /api/proxy/foo';
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
          },
        });
        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            headers: {},
          },
          logger,
          false,
        );
      });
    });

    describe('with logging turned off', () => {
      it('should create a request without logging', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        const expectedLog =
          'Creating GET request with http:backstage:request scaffolder action';
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
            logRequestPath: false,
          },
        });
        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            headers: {},
          },
          logger,
          false,
        );
      });
    });

    describe('with dry run enabled', () => {
      beforeEach(() => {
        mockContext.isDryRun = true;
      });

      afterEach(() => {
        mockContext.isDryRun = false;
      });

      it('should call http when a safe method is passed', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        const expectedLog =
          'Creating GET request with http:backstage:request scaffolder action';
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
            logRequestPath: false,
          },
        });
        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            headers: {},
          },
          logger,
          false,
        );
      });

      it('should skip when an unsafe method is passed', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        const expectedLog =
          "Dry run mode. Skipping non dry-run safe method 'POST' request to /api/proxy/foo";
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            logRequestPath: false,
          },
        });
        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info.mock.calls[1]).toContain(expectedLog);
        expect(http).not.toHaveBeenCalled();
      });
    });
  });
});
