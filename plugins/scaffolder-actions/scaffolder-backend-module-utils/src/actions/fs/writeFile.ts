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
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import fs from 'fs-extra';

export function createWriteFileAction() {
  return createTemplateAction({
    id: 'roadiehq:utils:fs:write',
    description: 'Creates a file with the content on the given path',
    supportsDryRun: true,
    schema: {
      input: {
        path: z => z.string().describe('Relative path'),
        content: z =>
          z.string().describe('This will be the content of the file'),
        preserveFormatting: z =>
          z
            .boolean()
            .describe('Specify whether to preserve formatting for JSON content')
            .optional(),
      },
      output: {
        path: z => z.string().describe('Path to the file that was written'),
      },
    },

    async handler(ctx) {
      const destFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );
      let formattedContent = ctx.input.content;
      if (ctx.input.preserveFormatting) {
        try {
          const parsedContent = JSON.parse(ctx.input.content);
          formattedContent = JSON.stringify(parsedContent, null, 2);
        } catch (error) {
          // Content is not JSON, no need to format
        }
      }

      fs.outputFileSync(destFilepath, formattedContent);

      ctx.output('path', destFilepath);
    },
  });
}
