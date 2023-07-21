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
import { getVoidLogger } from '@backstage/backend-common';
import { createWriteFileAction } from './writeFile';
import { PassThrough } from 'stream';
import mock from 'mock-fs';
import fs from 'fs-extra';
import { createReplaceInFileAction } from './replaceInFile';

describe('roadiehq:utils:fs:replace', () => {
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
  const action = createReplaceInFileAction();
  const fileCreationAction = createWriteFileAction();

  it('should throw error when required parameter files is not provided', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {} as any,
      }),
    ).rejects.toThrow(/files must be an Array/);
  });

  it('should throw error when required parameter files is not arr', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          files: 'not - array',
        } as any,
      }),
    ).rejects.toThrow(/files must be an Array/);
  });
  it('should throw error when required parameter files.file does not have find', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          files: [{ file: 'a', replaceWith: '' }],
        } as any,
      }),
    ).rejects.toThrow(/each file must have a find and replaceWith property/);
    await expect(
      action.handler({
        ...mockContext,
        input: {
          files: [{ file: 'a', find: '' }],
        } as any,
      }),
    ).rejects.toThrow(/each file must have a find and replaceWith property/);
  });
  it('should write file to the workspacePath with the given content', async () => {
    await fileCreationAction.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: 'foo: bar',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        files: [
          {
            file: 'fake-file.yaml',
            find: 'bar',
            replaceWith: 'baz',
          },
        ],
      } as any,
    });
    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    expect(file).toEqual('foo: baz');
  });
});
