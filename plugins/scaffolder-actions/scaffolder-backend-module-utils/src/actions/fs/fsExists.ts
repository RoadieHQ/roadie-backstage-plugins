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
import { InputError, isError } from '@backstage/errors';
import fs from 'fs-extra';

/**
 * Creates a new action that checks if a file exsits within the workspace.
 * @public
 */
export const createFilesystemExistsAction = () => {
  return createTemplateAction({
    id: 'fs:exists',
    description: 'Checks if a file exsits within the workspace',
    supportsDryRun: true,
    schema: {
      input: {
        file: z =>
          z.string({
            description: 'The path of the file check.',
          }),
      },
      output: {
        exists: z =>
          z
            .boolean({
              description: 'Boolean indicating if the file exists',
            })
            .optional(),
      },
    },
    async handler(ctx) {
      const file = ctx.input?.file;
      if (!file) {
        throw new InputError('file input must be a string');
      }

      const filePath = resolveSafeChildPath(ctx.workspacePath, file);

      try {
        const exists = fs.existsSync(filePath);
        ctx.output('exists', exists);
      } catch (e: unknown) {
        ctx.logger.error(
          `Failed to check if ${file} exists because: ${
            isError(e) ? e.message : 'unknown error'
          }.`,
        );
      }
    },
  });
};
