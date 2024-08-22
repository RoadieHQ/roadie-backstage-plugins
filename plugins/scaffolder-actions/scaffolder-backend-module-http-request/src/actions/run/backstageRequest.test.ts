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
import { getVoidLogger } from '@backstage/backend-common';
import { PassThrough } from 'stream'; // eslint-disable-line
import { http } from './helpers';
import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { mockServices, mockCredentials } from '@backstage/backend-test-utils';

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers.ts'),
  http: jest.fn(),
}));

describe('http:backstage:request', () => {
  let action: any;
  const mockBaseUrl = 'http://backstage.tests/api';
  const logger = getVoidLogger();
  const loggerSpy = jest.spyOn(logger, 'info');
  const discovery = UrlPatternDiscovery.compile(`${mockBaseUrl}/{{pluginId}}`);
  const auth = mockServices.auth();

  beforeEach(() => {
    jest.resetAllMocks();
    action = createHttpBackstageAction({ discovery, auth });
  });

  const mockContext = {
    workspacePath: os.tmpdir(),
    logger: logger,
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    getInitiatorCredentials: mockCredentials.service,
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
            path: '/testPlugin/foo',
            method: 'GET',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'GET',
            headers: {
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
            },
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
            path: 'testPlugin/foo',
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
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
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
            path: 'testPlugin/foo',
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
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
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
            path: 'testPlugin/foo',
            method: 'POST',
            body: 'test',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'POST',
            headers: {
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
            },
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
            path: 'testPlugin/foo',
            method: 'POST',
            body: '<?xml version="1.0" encoding="UTF-8"><node>asdf</node>',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'POST',
            headers: {
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
            },
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
            path: 'testPlugin/foo',
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
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
            },
            body: '[{"name":"test"}]',
          },
          logger,
          false,
        );
      });
    });

    describe('with authorization header', () => {
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
          input: {
            path: 'testPlugin/foo',
            method: 'POST',
            body: 'test',
            headers: HEADERS,
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/testPlugin/foo',
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
            path: 'testPlugin/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
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
          input: {
            path: `testPlugin/foo`,
            method: 'GET',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: `${mockBaseUrl}/testPlugin/foo`,
            method: 'GET',
            headers: {
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
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
          'Creating GET request with http:backstage:request scaffolder action against testPlugin/foo';
        await action.handler({
          ...mockContext,
          input: {
            path: 'testPlugin/foo',
            method: 'GET',
          },
        });
        expect(loggerSpy).toHaveBeenCalledTimes(2);
        expect(loggerSpy.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'GET',
            headers: {
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
            },
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
            path: 'testPlugin/foo',
            method: 'GET',
            logRequestPath: false,
          },
        });
        expect(loggerSpy).toHaveBeenCalledTimes(2);
        expect(loggerSpy.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'GET',
            headers: {
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
            },
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
            path: 'testPlugin/foo',
            method: 'GET',
            logRequestPath: false,
          },
        });
        expect(loggerSpy).toHaveBeenCalledTimes(2);
        expect(loggerSpy.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/testPlugin/foo',
            method: 'GET',
            headers: {
              authorization:
                'Bearer mock-service-token:{"sub":"external:test-service","target":"testPlugin"}',
            },
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
          "Dry run mode. Skipping non dry-run safe method 'POST' request to testPlugin/foo";
        await action.handler({
          ...mockContext,
          input: {
            path: 'testPlugin/foo',
            method: 'POST',
            logRequestPath: false,
          },
        });
        expect(loggerSpy).toHaveBeenCalledTimes(3);
        expect(loggerSpy.mock.calls[2]).toContain(expectedLog);
        expect(http).not.toHaveBeenCalled();
      });
    });
  });
});
