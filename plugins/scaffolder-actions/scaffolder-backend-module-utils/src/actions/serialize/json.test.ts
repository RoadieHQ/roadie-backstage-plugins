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
import { getVoidLogger } from '@backstage/backend-common';
import { createSerializeJsonAction } from './json';

describe('roadiehq:utils:serialize:json', () => {
  const mockContext = {
    task: {
      id: 'task-id',
    },
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    checkpoint: jest.fn(),
    getInitiatorCredentials: jest.fn(),
    workspacePath: 'lol',
  };
  const action = createSerializeJsonAction();

  it('should write file to the workspacePath with the given content', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: { hello: 'world' },
        replacer: [],
        space: '',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'serialized',
      JSON.stringify({ hello: 'world' }),
    );
  });

  it('should write file to the workspacePath with spaces', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: { hello1: 'world1' },
        replacer: [],
        space: '\t',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'serialized',
      JSON.stringify({ hello1: 'world1' }, null, '\t'),
    );
  });
});
