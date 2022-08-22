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
import { merge } from 'lodash';

export function createMergeJSONAction(options?: { actionId?: string }) {
  return createTemplateAction<{ path: string; content: any }>({
    id: options?.actionId || 'roadiehq:utils:json:merge',
    description: 'Merge new data into an existing JSON file.',
    schema: {
      input: {
        type: 'object',
        required: ['content', 'path'],
        properties: {
          path: {
            title: 'Path',
            description: 'Path to existing file to append.',
            type: 'string',
          },
          content: {
            title: 'Content',
            description: 'This will be merged into to the file',
            type: 'object',
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
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );

      let existingContent = {};

      if (fs.existsSync(sourceFilepath)) {
        existingContent = JSON.parse(
          fs.readFileSync(sourceFilepath).toString(),
        );
      }

      fs.writeFileSync(
        sourceFilepath,
        JSON.stringify(merge(existingContent, ctx.input.content)),
      );
      ctx.output('path', sourceFilepath);
    },
  });
}
