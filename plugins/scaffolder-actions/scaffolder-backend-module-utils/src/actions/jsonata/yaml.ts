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
import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import jsonata from 'jsonata';
import { resolveSafeChildPath } from '@backstage/backend-common';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import { supportedDumpOptions, yamlOptionsSchema } from '../../types';

export function createYamlJSONataTransformAction() {
  return createTemplateAction<{
    path: string;
    expression: string;
    options?: supportedDumpOptions;
  }>({
    id: 'roadiehq:utils:jsonata:yaml:transform',
    description:
      'Allows performing jsonata opterations and transformations on a YAML file in the workspace. The result can be read from the `result` step output.',
    supportsDryRun: true,
    schema: {
      input: {
        type: 'object',
        required: ['path', 'expression'],
        properties: {
          path: {
            title: 'Path',
            description: 'Input path to read yaml file.',
            type: 'string',
          },
          expression: {
            title: 'Expression',
            description: 'JSONata expression to perform on the input',
            type: 'string',
          },
          options: yamlOptionsSchema,
        },
      },
      output: {
        type: 'object',
        properties: {
          result: {
            title: 'Output result from JSONata',
            type: 'object',
          },
        },
      },
    },
    async handler(ctx) {
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );

      const data = yaml.load(fs.readFileSync(sourceFilepath).toString());
      const expression = jsonata(ctx.input.expression);
      const result = yaml.dump(expression.evaluate(data), ctx.input.options);

      ctx.output('result', result);
    },
  });
}
