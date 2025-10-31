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
import { PassThrough } from 'stream';
import { createWriteFileAction } from './writeFile';
import mock from 'mock-fs';
import fs from 'fs-extra';
import { mockServices } from '@backstage/backend-test-utils';

describe('roadiehq:utils:fs:write', () => {
  beforeEach(() => {
    mock({
      'fake-tmp-dir': {},
    });
  });
  afterEach(() => mock.restore());
  const mockContext = {
    logger: mockServices.logger.mock(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    checkpoint: jest.fn(),
    getInitiatorCredentials: jest.fn(),
    workspacePath: 'lol',
    task: {
      id: 'task-id',
      getWorkspaceName: jest.fn(),
      getWorkspacePath: jest.fn(),
      getLogger: jest.fn(),
      emitLog: jest.fn(),
      getSecrets: jest.fn(),
      getWorkspaceInfo: jest.fn(),
    },
  };
  const action = createWriteFileAction();

  it('should throw error when required parameter path is not provided', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {} as any,
      }),
    ).rejects.toThrow(/argument must be of type string/);
  });
  it('should write file to the workspacePath with the given content', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: 'foo: bar',
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    expect(file).toEqual('foo: bar');
  });
  it('should overwrite the file if it already exists', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': "This text shouldn't be in the file",
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: 'foo: bar',
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    expect(file).toEqual('foo: bar');
  });
  it('should put path on the output property', async () => {
    const ctx = {
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: 'foo: bar',
      },
    };
    await action.handler(ctx);

    expect(ctx.output.mock.calls[0][0]).toEqual('path');
    expect(ctx.output.mock.calls[0][1]).toContain(
      '/fake-tmp-dir/fake-file.yaml',
    );
  });
});
