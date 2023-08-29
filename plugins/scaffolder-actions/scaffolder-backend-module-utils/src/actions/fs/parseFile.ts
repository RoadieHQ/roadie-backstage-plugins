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
import { resolveSafeChildPath } from '@backstage/backend-common';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fs from 'fs-extra';
import { extname } from 'node:path';
import { parseContent } from '../../utils';

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
      if (!fs.existsSync(sourceFilepath)) {
        ctx.logger.error(`The file ${sourceFilepath} does not exist.`);
        throw new Error(`The file ${sourceFilepath} does not exist.`);
      }

      const originalContent = fs.readFileSync(sourceFilepath).toString();
      const fileExtension = extname(sourceFilepath);
      const content = parseContent(
        originalContent,
        fileExtension,
        ctx.input.parser,
      );

      ctx.output('content', content as any);
    },
  });
}
