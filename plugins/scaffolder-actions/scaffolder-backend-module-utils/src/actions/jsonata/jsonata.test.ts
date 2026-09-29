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
import { PassThrough } from 'stream';
import { createJSONataAction } from './jsonata';
import { mockServices } from '@backstage/backend-test-utils';
import { createTemplateRenderer } from 'nunjitsu';

describe('roadiehq:utils:jsonata', () => {
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

  // https://github.com/RoadieHQ/roadie-backstage-plugins/issues/2285
  // Backstage >= 1.54 stores each step's output in a nunjitsu template context,
  // which rejects arrays carrying extra own properties. JSONata sequences are
  // arrays tagged with hidden `sequence` / `keepSingleton` properties.
  describe('step output compatibility with the scaffolder template context', () => {
    const runStep = async (expression: string) => {
      const output = jest.fn();
      await action.handler({
        ...mockContext,
        output,
        input: { data: { items: ['a', 'b'] }, expression },
      });
      const [[name, value]] = output.mock.calls;

      // Mirrors NunjucksWorkflowRunner.execute after a step completes
      const renderer = createTemplateRenderer({});
      const context = renderer
        .prepareContext({ steps: {} })
        .withValue(['steps', 'jsonata'], { output: { [name]: value } });
      return renderer.renderValue(
        '${{ steps.jsonata.output.result }}',
        context,
      );
    };

    it('stores a JSONata sequence result without throwing', async () => {
      await expect(
        runStep('$map(items, function($i) { $uppercase($i) })[]'),
      ).resolves.toEqual(['A', 'B']);
    });

    it('stores a plain array result without throwing', async () => {
      await expect(
        runStep('$append($map(items, function($i) { $uppercase($i) }), [])'),
      ).resolves.toEqual(['A', 'B']);
    });
  });
});
