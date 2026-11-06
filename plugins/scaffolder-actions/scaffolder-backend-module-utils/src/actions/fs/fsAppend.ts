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
import {
  createTemplateAction,
  ActionContext,
} from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';

import { InputError } from '@backstage/errors';
import fs from 'fs-extra';

type FsAppendParams = {
  file: string;
  text: string;
};
/**
 * Creates a new action that appends text to a file in the workspace.
 * @public
 */
export const createFilesystemAppendAction = () => {
  return createTemplateAction({
    id: 'fs:append',
    description: 'Appends text to a file within the workspace',
    supportsDryRun: true,
    schema: {
      input: {
        file: z =>
          z.string({
            description:
              'The path of the file append to. This must be a path within the workspace.',
          }),
        text: z =>
          z.string({
            description: 'The text to append to the file.',
          }),
      },
    },
    async handler(ctx: ActionContext<FsAppendParams>) {
      const file = ctx.input?.file;
      const text = ctx.input?.text;
      if (!file) {
        throw new InputError('file input must be a string');
      }
      if (!text) {
        throw new InputError('text input must be a string');
      }

      const filePath = resolveSafeChildPath(ctx.workspacePath, file);

      try {
        ctx.logger.info(`Appending text to ${file}.`);
        fs.appendFileSync(filePath, text);
      } catch (e: any) {
        ctx.logger.error(`Failed to to append text to ${file} because: ${e}.`);
      }
    },
  });
};
