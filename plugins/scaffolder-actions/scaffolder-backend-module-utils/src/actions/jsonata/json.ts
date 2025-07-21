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

export function createJsonJSONataTransformAction() {
  return createTemplateAction({
    id: 'roadiehq:utils:jsonata:json:transform',
    description:
      'Allows performing JSONata operations and transformations on a JSON file in the workspace. The result can be read from the `result` step output.',
    supportsDryRun: true,
    schema: {
      input: {
        path: z => z.string().describe('Input path to read json file'),
        expression: z =>
          z.string().describe('JSONata expression to perform on the input'),
        replacer: z =>
          z.array(z.string()).describe('Replacer array').optional(),
        space: z => z.string().describe('Space character').optional(),
        as: z =>
          z
            .enum(['string', 'object'])
            .describe('Desired Result Type. Permitted values are: "string" (default) and "object"')
            .default('string')
            .optional(),
      },
      output: {
        result: z =>
          z
            .union([z.string(), z.record(z.any())])
            .describe('Output result from JSONata'),
      },
    },
    async handler(ctx) {
      let resultHandler: (rz: any) => any;

      if (ctx.input.as === 'object') {
        resultHandler = rz => rz;
      } else {
        resultHandler = rz =>
          JSON.stringify(rz, ctx.input.replacer, ctx.input.space);
      }
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );

      const data = JSON.parse(fs.readFileSync(sourceFilepath).toString());
      const expression = jsonata(ctx.input.expression);
      const result = await expression.evaluate(data);

      ctx.output('result', resultHandler(result));
    },
  });
}
