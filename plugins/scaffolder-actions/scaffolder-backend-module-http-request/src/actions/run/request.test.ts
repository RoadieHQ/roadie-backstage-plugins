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
import { createHttpAction } from './request';
import os from 'os'; // eslint-disable-line
import { getVoidLogger } from '@backstage/backend-common';
import { PassThrough } from 'stream'; // eslint-disable-line
import { http } from './helpers';

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers.ts'),
  http: jest.fn(),
}));

describe('http:request', () => {
  let action: any;
  const logger = getVoidLogger();

  beforeEach(() => {
    jest.resetAllMocks();
    action = createHttpAction();
  });

  const mockContext = {
    workspacePath: os.tmpdir(),
    logger: logger,
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  describe('when the action runs correctly', () => {
    describe('with a simple request', () => {
      it('should create a request', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            url: 'http://example.com/bloop',
            method: 'GET',
          },
        });
        expect(http).toBeCalledWith(
          {
            url: 'http://example.com/bloop',
            method: 'GET',
            headers: {},
          },
          logger,
        );
      });
    });
  });
});
