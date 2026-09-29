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

// JSONata returns "sequences": arrays tagged with hidden own properties such as
// `sequence` and `keepSingleton`. The scaffolder template context rejects arrays
// with custom properties, so copy the result into plain arrays and objects.
function toPlainValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toPlainValue);
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toPlainValue(item)]),
    );
  }
  return value;
}

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
        result: z => z.unknown().describe('Output result from JSONata'),
      },
    },

    async handler(ctx) {
      try {
        const expression = jsonata(ctx.input.expression);
        const result = await expression.evaluate(ctx.input.data);

        ctx.output('result', toPlainValue(result));
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
