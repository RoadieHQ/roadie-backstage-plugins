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
import { createJSONataAction } from './jsonata';
import { PassThrough } from 'stream';

describe('roadiehq:utils:jsonata', () => {
  const mockContext = {
    workspacePath: 'lol',
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };
  const action = createJSONataAction();

  it('should pasrs text data by default', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        data: {
          blah: ['item1'],
        },
        expression: '$ ~> | $ | { "blah": [blah, "item2"] }|',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith('result', {
      blah: ['item1', 'item2'],
    });
  });
});
