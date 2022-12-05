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
import { createYamlJSONataTransformAction } from './yaml';
import { PassThrough } from 'stream';
import mock from 'mock-fs';
import fs from 'fs-extra';
import yaml from 'js-yaml';

describe('roadiehq:utils:jsonata:yaml:transform', () => {
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
  const action = createYamlJSONataTransformAction();

  it('should write file to the workspacePath with the given transformation', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': 'hello: [world]',
      },
    });
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        expression: '$ ~> | $ | { "hello": [hello, "item2"] }|',
        writeOutputPath: 'updated-file.yaml',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'result',
      yaml.dump({ hello: ['world', 'item2'] }),
    );
    expect(fs.existsSync('fake-tmp-dir/updated-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/updated-file.yaml', 'utf-8');
    expect(file).toEqual(yaml.dump({ hello: ['world', 'item2'] }));
  });
});
