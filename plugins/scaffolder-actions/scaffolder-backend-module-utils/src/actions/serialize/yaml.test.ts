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
import { mockServices } from '@backstage/backend-test-utils';

describe('roadiehq:utils:serialize:yaml', () => {
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

  it('should serialize complex nested objects', async () => {
    const complexData = {
      metadata: {
        name: 'my-service',
        labels: {
          app: 'backend',
          version: 'v1.0.0',
        },
      },
      spec: {
        replicas: 3,
        ports: [8080, 9090],
        env: {
          NODE_ENV: 'production',
          DEBUG: false,
        },
      },
    };

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: complexData,
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'serialized',
      YAML.stringify(complexData),
    );
  });

  it('should work with minimal input (no options)', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: { simple: 'yaml-test', number: 42 },
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'serialized',
      YAML.stringify({ simple: 'yaml-test', number: 42 }),
    );
  });
});
