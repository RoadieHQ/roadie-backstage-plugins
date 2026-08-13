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
import { logIfHtmlResponse } from './logIfHtmlResponse';
import { mockServices } from '@backstage/backend-test-utils';

describe('logIfHtmlResponse', () => {
  it('logs when response content type header includes text/html', async () => {
    const logger = mockServices.logger.mock();
    const response = new Response('', {
      status: 1,
      headers: {
        'content-type': 'text/html',
      },
    });

    await logIfHtmlResponse(response, logger);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('logs html response when content type header includes text/html', async () => {
    const logger = mockServices.logger.mock();
    const response = new Response('<html>some html</html>', {
      status: 1,
      headers: {
        'content-type': 'text/html',
      },
    });

    await logIfHtmlResponse(response, logger);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('<html>some html</html>'),
    );
  });

  it('logs response status code when content type header includes text/html', async () => {
    const logger = mockServices.logger.mock();
    const response = new Response('', {
      status: 1,
      headers: {
        'content-type': 'text/html',
      },
    });

    await logIfHtmlResponse(response, logger);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('1'));
  });

  it('logs url response when content type header includes text/html', async () => {
    const logger = mockServices.logger.mock();
    const response = new Response('', {
      status: 1,
      headers: {
        'content-type': 'text/html',
      },
    });
    // Response.url is readonly, so define it in the test
    Object.defineProperty(response, 'url', {
      value: 'some-url',
      configurable: true,
    });

    await logIfHtmlResponse(response, logger);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('some-url'),
    );
  });

  it('does not log when response content type is missing', async () => {
    const logger = mockServices.logger.mock();
    const response = new Response('', {
      status: 1,
      headers: {},
    });

    await logIfHtmlResponse(response, logger);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('does not log when response content type is only json', async () => {
    const logger = mockServices.logger.mock();
    const response = new Response('', {
      status: 1,
      headers: {
        'content-type': 'application/json',
      },
    });

    await logIfHtmlResponse(response, logger);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('does not log when response content type includes application json to prevent sensitive data logs', async () => {
    const logger = mockServices.logger.mock();
    const response = new Response('', {
      status: 1,
      headers: {
        'content-type': 'application/json text/html',
      },
    });

    await logIfHtmlResponse(response, logger);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('reads the response body safely without consuming the original response', async () => {
    const logger = mockServices.logger.mock();
    const response = new Response('<html>some html</html>', {
      status: 1,
      headers: {
        'content-type': 'text/html',
      },
    });
    const textMock = jest.fn().mockResolvedValue(response.text());
    const cloneMock = jest.fn().mockReturnValue({
      text: textMock,
    });

    // Response.clone is readonly, so define it in the test
    Object.defineProperty(response, 'clone', {
      value: cloneMock,
      configurable: true,
    });

    await logIfHtmlResponse(response, logger);
    expect(cloneMock).toHaveBeenCalledTimes(1);
    expect(textMock).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('<html>some html</html>'),
    );
  });
});
