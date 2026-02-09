/*
 * Copyright 2021 Larder Software Limited
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
import fg from 'fast-glob';
import fs from 'fs-extra';
import os from 'node:os'
import { InputError } from '@backstage/errors';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';

export function createReplaceInFileAction() {
  return createTemplateAction({
    id: 'roadiehq:utils:fs:replace',
    description: 'Replaces content of a file with given values.',
    supportsDryRun: true,
    schema: {
      input: {
        files: z =>
          z.array(
            z.object({
              file: z
                .string()
                .describe(
                  'The source location of the file to be used to run replace against (supports wildcards)',
                )
                .optional(),
              find: z.string().describe('A string to be replaced').optional(),
              matchRegex: z
                .boolean()
                .describe('Use regex to match the find string')
                .optional(),
              replaceWith: z
                .string()
                .describe('Text to be used to replace the found lines with')
                .optional(),
              includeDotFiles: z
                .boolean()
                .describe(
                  'A configuration option to include dotfiles when globbing files. Defaults to false',
                )
                .optional(),
            }),
          ),
      },
    },
    async handler(ctx) {
      if (!Array.isArray(ctx.input?.files)) {
        throw new InputError('files must be an Array');
      }

      for (const file of ctx.input.files) {
        if (!file.file) {
          throw new InputError('Path to file needs to be defined');
        }
        if (!file.find || !file.replaceWith) {
          throw new InputError(
            'each file must have a find and replaceWith property',
          );
        }

        let sourceFilepath = resolveSafeChildPath(
          ctx.workspacePath,
          file.file,
        );

        if (os.platform() === 'win32') {
          sourceFilepath = fg.win32.convertPathToPattern(sourceFilepath);
        }

        const resolvedSourcePaths = await fg(sourceFilepath, {
          cwd: ctx.workspacePath,
          absolute: true,
          dot: file.includeDotFiles ?? false,
        });

        for (const filepath of resolvedSourcePaths) {
          const content: string = fs.readFileSync(filepath).toString();

          let find: string | RegExp = file.find;
          if (file.matchRegex) {
            find = new RegExp(file.find, 'g');
          }

          const replacedContent = content.replaceAll(find, file.replaceWith);

          fs.writeFileSync(filepath, replacedContent);
        }
      }
    },
  });
}
