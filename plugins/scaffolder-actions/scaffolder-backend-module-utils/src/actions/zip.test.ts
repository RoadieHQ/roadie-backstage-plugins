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
import { mockServices } from '@backstage/backend-test-utils';
import { createZipAction } from './zip';
import mock from 'mock-fs';
import fs from 'fs-extra';

const mockLogger = mockServices.logger.mock();
mockLogger.error = jest.fn();

describe('roadiehq:utils:zip', () => {
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
  const action = createZipAction();

  beforeEach(() => {
    mock({
      'fake-tmp-dir': {
        'folder-to-be-zipped': {
          foo: 'bar',
          ['fake-file.yaml']: 'foo: bar',
        },
      },
    });
  });
  afterEach(() => {
    mock.restore();
  });
  it('should throw error when parameter path is not provided', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {} as any,
      }),
    ).rejects.toThrow(/argument must be of type string/);
  });
  it("should create a zip file called 'outputPath' from the given 'path'", async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'folder-to-be-zipped',
        outputPath: 'folder-to-be-zipped.zip',
      },
    });

    expect(fs.existsSync('fake-tmp-dir/folder-to-be-zipped.zip')).toBe(true);
  });
  it('should put path on the output property', async () => {
    const ctx = {
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'folder-to-be-zipped/fake-file.yaml',
        outputPath: 'fake-file.yaml.zip',
      },
    };
    await action.handler(ctx);

    expect(ctx.output).toHaveBeenCalledWith('outputPath', 'fake-file.yaml.zip');
  });
  it('should throw InputError when file does not exist', async () => {
    const ctx = {
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'non/existent/path',
        outputPath: 'fake-file.yaml.zip',
      },
    };
    await expect(action.handler(ctx)).rejects.toThrow(
      "File non/existent/path does not exist. Can't zip it.",
    );
  });
});
