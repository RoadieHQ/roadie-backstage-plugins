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
import { getVoidLogger } from '@backstage/backend-common';
import { createParseFileAction } from './parseFile';
import { PassThrough } from 'stream';
import mock from 'mock-fs';

describe('roadiehq:utils:fs:parse', () => {
  beforeEach(() => {
    mock({
      'fake-tmp-dir': {},
    });
  });
  afterEach(() => mock.restore());
  const mockContext = {
    workspacePath: 'lol',
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };
  const action = createParseFileAction();

  it('should throw error when required parameter path is not provided', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {} as any,
      }),
    ).rejects.toThrow(/"path" argument must/);
  });
  it('should pasrs text data by default', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.txt': 'Some data',
      },
    });
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.txt',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith('content', 'Some data');
  });

  it('should parse json data', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': '{ "hello": "world" }',
      },
    });
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        parser: 'json',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith('content', {
      hello: 'world',
    });
  });

  it('should parse yaml data', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': 'hello: world',
      },
    });
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        parser: 'yaml',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith('content', {
      hello: 'world',
    });
  });

  it('should parse multiyaml data', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': '---\nhello: world\n---\nsecondhello: world',
      },
    });
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        parser: 'multiyaml',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith('content', {
      hello: 'world',
    });
  });
});
