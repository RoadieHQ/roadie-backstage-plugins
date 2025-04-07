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
import { createSerializeYamlAction } from './yaml';
import YAML from 'yaml';
import { getVoidLogger } from '@backstage/backend-common';

describe('roadiehq:utils:serialize:yaml', () => {
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
  const action = createSerializeYamlAction();

  it('should write file to the workspacePath with the given content', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: { hello: 'world' },
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'serialized',
      YAML.stringify({ hello: 'world' }),
    );
  });

  it('should write file to the workspacePath with spaces', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: { hello1: 'world1', hello2: { asdf: 'blah' } },
        options: {
          indent: 10,
        },
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'serialized',
      YAML.stringify(
        { hello1: 'world1', hello2: { asdf: 'blah' } },
        { indent: 10 },
      ),
    );
  });

  it('should write file to the workspacePath with multidoc content', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: [{ hello: 'world' }, { are: 'you there?' }],
        writeMulti: true,
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'serialized',
      `hello: world\n---\nare: you there?\n`,
    );
  });

  it('should error when input is not suitable for multidoc', async () => {
    await expect(
      action.handler({
        ...mockContext,
        workspacePath: 'fake-tmp-dir',
        input: {
          data: { hello: 'world' },
          writeMulti: true,
        },
      }),
    ).rejects.toThrow(
      'input is not an array, cannot be stringified as multidoc yaml',
    );
  });

  it('should pass options to YAML.stringify', async () => {
    const opts = {
      indent: 3,
      noArrayIndent: true,
      skipInvalid: true,
      flowLevel: 23,
      sortKeys: true,
      lineWidth: -1,
      noRefs: true,
      noCompatMode: true,
      condenseFlow: true,
      quotingType: '"' as const,
      forceQuotes: true,
    };

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: { hello3: 'world3' },
        options: opts,
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'serialized',
      YAML.stringify({ hello3: 'world3' }, opts),
    );
  });
});
