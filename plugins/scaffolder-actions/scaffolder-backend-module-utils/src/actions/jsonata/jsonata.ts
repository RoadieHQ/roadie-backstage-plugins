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

export function createJSONataAction() {
  return createTemplateAction({
    id: 'roadiehq:utils:jsonata',
    description:
      'Allows performing JSONata operations and transformations on input objects and produces the output result as a step output.',
    supportsDryRun: true,
    schema: {
      input: {
        data: z => z.any().describe('Input data to be transformed'),
        expression: z =>
          z.string().describe('JSONata expression to perform on the input'),
      },
      output: {
        result: z => z.record(z.any()).describe('Output result from JSONata'),
      },
    },

    async handler(ctx) {
      try {
        const expression = jsonata(ctx.input.expression);
        const result = await expression.evaluate(ctx.input.data);

        ctx.output('result', result);
      } catch (e: any) {
        const message = e.hasOwnProperty('message')
          ? e.message
          : 'unknown JSONata evaluation error';
        throw new Error(
          `JSONata failed to evaluate the expression: ${message}`,
        );
      }
    },
  });
}
