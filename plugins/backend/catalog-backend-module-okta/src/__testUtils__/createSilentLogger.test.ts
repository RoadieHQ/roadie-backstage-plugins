/*
 * Copyright 2022 Larder Software Limited
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

import { createLogger } from 'winston';
import { createSilentLogger } from '.';

const NO_TRANSPORTS_PATTERN = /no transports/;

describe('createSilentLogger', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('does not trigger winston\'s "no transports" warning when logs are written', () => {
    const logger = createSilentLogger();

    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    const noTransportsCalls = consoleErrorSpy.mock.calls.filter(args =>
      NO_TRANSPORTS_PATTERN.test(String(args[0])),
    );
    expect(noTransportsCalls).toEqual([]);
  });

  // Sanity check: confirms that a bare createLogger() *would* trigger the
  // warning, so the assertion above is meaningful. If winston ever fixes
  // this upstream, this test will fail and the workaround can be removed.
  it('confirms a bare createLogger() does trigger the warning', () => {
    const logger = createLogger();

    logger.info('info message');

    const noTransportsCalls = consoleErrorSpy.mock.calls.filter(args =>
      NO_TRANSPORTS_PATTERN.test(String(args[0])),
    );
    expect(noTransportsCalls.length).toBeGreaterThan(0);
  });
});
