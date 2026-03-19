/*
 * Copyright 2023 Larder Software Limited
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
import { PassThrough } from 'stream';
import { createJsonJSONataTransformAction } from './json';
import mock from 'mock-fs';
import { mockServices } from '@backstage/backend-test-utils';

describe('roadiehq:utils:jsonata:json:transform', () => {
  beforeEach(() => {
    mock({
      'fake-tmp-dir': {},
    });
  });
  afterEach(() => mock.restore());
  const mockContext = {
    task: {
      id: 'task-id',
    },
    logger: mockServices.logger.mock(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    checkpoint: jest.fn(),
    getInitiatorCredentials: jest.fn(),
    workspacePath: 'lol',
  };
  const action = createJsonJSONataTransformAction();

  it('should output default string result of having applied the given transformation', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': '{ "hello": ["world"] }',
      },
    });
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        expression: '$ ~> | $ | { "hello": [hello, "item2"] }|',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'result',
      JSON.stringify({ hello: ['world', 'item2'] }),
    );
  });

  it('should output string result of having applied the given transformation', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': '{ "hello": ["world"] }',
      },
    });
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        expression: '$ ~> | $ | { "hello": [hello, "item2"] }|',
        as: 'string',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'result',
      JSON.stringify({ hello: ['world', 'item2'] }),
    );
  });

  it('should output object result of having applied the given transformation', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': '{ "hello": ["world"] }',
      },
    });
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        expression: '$ ~> | $ | { "hello": [hello, "item2"] }|',
        as: 'object',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith('result', {
      hello: ['world', 'item2'],
    });
  });
});
