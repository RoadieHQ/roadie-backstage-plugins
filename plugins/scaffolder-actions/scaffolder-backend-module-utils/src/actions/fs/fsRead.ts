/*
 * Copyright 2026 Larder Software Limited
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

export function createReadFileAction() {
  return createTemplateAction({
    id: 'fs:read',
    description: 'Reads a file from the workspace',
    supportsDryRun: true,
    schema: {
      input: {
        path: z =>
          z.string({
            description: 'Path to the file to read.',
          }),
      },
      output: {
        content: z =>
          z.string({
            description: 'Content of the file',
          }),
      },
    },
    async handler(ctx) {
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );

      const content = fs.readFileSync(sourceFilepath).toString();
      ctx.output('content', content);
    },
  });
}
