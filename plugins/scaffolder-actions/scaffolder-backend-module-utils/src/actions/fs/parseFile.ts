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
import { resolveSafeChildPath } from '@backstage/backend-common';
import fs from 'fs-extra';
import yaml from 'js-yaml';

const parsers: Record<'yaml' | 'json' | 'multiyaml', (cnt: string) => any> = {
  yaml: (cnt: string) => yaml.load(cnt),
  json: (cnt: string) => JSON.parse(cnt),
  multiyaml: (cnt: string) => yaml.loadAll(cnt),
};

export function createParseFileAction() {
  return createTemplateAction<{
    path: string;
    parser?: 'yaml' | 'json' | 'multiyaml';
  }>({
    id: 'roadiehq:utils:fs:parse',
    description: 'Reads a file from the workspace and optionally parses it',
    supportsDryRun: true,
    schema: {
      input: {
        type: 'object',
        required: ['path'],
        properties: {
          path: {
            title: 'Path',
            description: 'Path to the file to read.',
            type: 'string',
          },
          parser: {
            title: 'Parse',
            description: 'Optionally parse the content to an object.',
            type: 'string',
            enum: ['yaml', 'json', 'multiyaml'],
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          content: {
            title: 'Content of the file',
            type: ['string', 'object'],
          },
        },
      },
    },
    async handler(ctx) {
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );
      const parserName = ctx.input.parser;
      let parser = (content: string) => content;

      if (parserName) {
        parser = parsers[parserName];
      }

      const content: string | object = parser(
        fs.readFileSync(sourceFilepath).toString(),
      );

      ctx.output('content', content);
    },
  });
}
