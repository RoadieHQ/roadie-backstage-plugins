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

export function createAppendFileAction() {
  return createTemplateAction({
    id: 'roadiehq:utils:fs:append',
    description:
      'Append content to the end of the given file, it will create the file if it does not exist.',
    supportsDryRun: true,
    schema: {
      input: {
        path: z => z.string().describe('Path to existing file to append.'),
        content: z => z.string().describe('This will be appended to the file'),
      },
      output: {
        path: z => z.string().describe('Path to the file that was appended to'),
      },
    },
    async handler(ctx) {
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );

      fs.appendFileSync(sourceFilepath, ctx.input.content);
      ctx.output('path', sourceFilepath);
    },
  });
}
