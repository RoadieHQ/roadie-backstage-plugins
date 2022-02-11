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
import {
  ContainerRunner,
} from '@backstage/backend-common';
import {
  createTemplateAction,
} from '@backstage/plugin-scaffolder-backend';

/**
 * Creates a `shell:run` Scaffolder action.
 *
 * @remarks
 *
 * @param options - Shell Configuration.
 * @public
 */
export function createShellRunAction(options: {
  containerRunner: ContainerRunner;
}) {
  const { containerRunner } = options;

  return createTemplateAction<{
    command: string
  }>({
    id: 'shell:run',
    description:
      'Runs an arbitrary command against the workspace.',
    schema: {
      input: {
        type: 'object',
        required: ['command'],
        properties: {
          command: {
            title: 'Command',
            description:
              'Command to run',
            type: 'string',
          }
        },
      },
    },
    async handler(ctx) {
      if (!ctx.input.command) {
        throw new Error(`Command has not been provided`)
      }
      await containerRunner.runContainer({
        args: ["-c", ctx.input.command],
        command: "bash",
        imageName: "bash",
        logStream: ctx.logStream,
        workingDir: '/input',
        mountDirs: {
          [ctx.workspacePath]: "/input",
        }
      })
    },
  });
}
