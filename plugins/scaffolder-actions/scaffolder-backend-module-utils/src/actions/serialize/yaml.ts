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
import YAML from 'yaml';
import { stringifyOptions, yamlOptionsSchema } from '../../types';

import { TemplateAction } from '@backstage/plugin-scaffolder-node';

export function createSerializeYamlAction(): TemplateAction<{
  data: any;
  options?: stringifyOptions;
  writeMulti?: boolean;
}> {
  return createTemplateAction<{
    data: any;
    options?: stringifyOptions;
    writeMulti?: boolean;
  }>({
    id: 'roadiehq:utils:serialize:yaml',
    description: 'Allows performing serialization on an object',
    supportsDryRun: true,
    schema: {
      input: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            title: 'Data',
            description: 'Input data to perform seriazation on.',
            type: 'object',
          },
          replacer: {
            title: 'Replacer',
            description: 'Replacer array',
            type: 'array',
            items: {
              type: 'string',
            },
          },
          options: yamlOptionsSchema,
          writeMulti: {
            title: 'Write Multi',
            description:
              'Use this if the yaml output should be multiple yaml documents (separated by ---).',
            type: 'boolean',
          },
        },
      },
      output: {
        type: 'string',
        properties: {
          serialized: {
            title: 'Output result from serialization',
            type: 'string',
          },
        },
      },
    },

    async handler(ctx) {
      const serialized = ctx.input.writeMulti
        ? yamlStringifyAll(ctx.input.data, ctx.input.options)
        : YAML.stringify(ctx.input.data, ctx.input.options);
      ctx.output('serialized', serialized);
    },
  });
}

export function yamlStringifyAll(
  value: any,
  options?: stringifyOptions,
): string {
  if (!Array.isArray(value)) {
    throw new Error(
      'input is not an array, cannot be stringified as multidoc yaml',
    );
  }
  return value.map((doc: any) => YAML.stringify(doc, options)).join('---\n');
}
