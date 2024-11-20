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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import jsonata from 'jsonata';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import fs from 'fs-extra';
import YAML from 'yaml';
import { stringifyOptions, yamlOptionsSchema } from '../../types';

export function createYamlJSONataTransformAction() {
  return createTemplateAction<{
    path: string;
    expression: string;
    options?: stringifyOptions;
    loadAll?: boolean;
    as?: 'string' | 'object';
  }>({
    id: 'roadiehq:utils:jsonata:yaml:transform',
    description:
      'Allows performing JSONata operations and transformations on a YAML file in the workspace. The result can be read from the `result` step output.',
    supportsDryRun: true,
    schema: {
      input: {
        type: 'object',
        required: ['path', 'expression'],
        properties: {
          path: {
            title: 'Path',
            description: 'Input path to read yaml file',
            type: 'string',
          },
          expression: {
            title: 'Expression',
            description: 'JSONata expression to perform on the input',
            type: 'string',
          },
          loadAll: {
            title: 'Load All',
            description:
              'Use this if the yaml source file contains multiple yaml objects',
            type: 'boolean',
          },
          as: {
            title: 'Desired Result Type',
            description:
              'Permitted values are: "string" (default) and "object"',
            type: 'string',
            enum: ['string', 'object'],
          },
          options: yamlOptionsSchema,
        },
      },
      output: {
        type: 'object',
        properties: {
          result: {
            title: 'Output result from JSONata',
            type: 'object | string',
          },
        },
      },
    },
    async handler(ctx) {
      let resultHandler: (rz: any) => any;

      if (ctx.input.as === 'object') {
        resultHandler = rz => rz;
      } else {
        resultHandler = rz => YAML.stringify(rz, ctx.input.options);
      }
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );
      let data;
      if (ctx.input.loadAll) {
        data = YAML.parseAllDocuments(
          fs.readFileSync(sourceFilepath).toString(),
        ).map(doc => doc.toJSON());
      } else {
        data = YAML.parse(fs.readFileSync(sourceFilepath).toString());
      }
      const expression = jsonata(ctx.input.expression);
      const result = await expression.evaluate(data);

      ctx.output('result', resultHandler(result));
    },
  });
}
