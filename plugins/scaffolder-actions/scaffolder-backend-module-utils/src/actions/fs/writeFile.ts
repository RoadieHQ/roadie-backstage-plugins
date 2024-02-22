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

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { resolveSafeChildPath } from '@backstage/backend-common';
import fs from 'fs-extra';

export function createWriteFileAction() {
  return createTemplateAction<{
    path: string;
    content: string;
    preserveFormatting?: boolean;
  }>({
    id: 'roadiehq:utils:fs:write',
    description: 'Creates a file with the content on the given path',
    supportsDryRun: true,
    schema: {
      input: {
        required: ['path', 'content'],
        type: 'object',
        properties: {
          path: {
            title: 'Path',
            description: 'Relative path',
            type: 'string',
          },
          content: {
            title: 'Content',
            description: 'This will be the content of the file',
            type: 'string',
          },
          preserveFormatting: {
            title: 'Preserve Formatting',
            description:
              'Specify whether to preserve formatting for JSON content',
            type: 'boolean',
            default: false,
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          path: {
            title: 'Path',
            type: 'string',
          },
        },
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

      // fs.outputFileSync(destFilepath, ctx.input.content);
      ctx.output('path', destFilepath);
    },
  });
}
