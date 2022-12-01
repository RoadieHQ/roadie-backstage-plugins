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
import { execFile, ChildProcess } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execFilePromise = promisify(execFile);

const createMessageSanitizer = (ctx: { workspacePath: string }) => {
  return (message: string) => {
    return message.replace(ctx.workspacePath, '<redacted>');
  };
};

const wait = async (
  process: ChildProcess,
): Promise<{ stdout: string; stderr: string }> => {
  return await new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    process.stdout?.on('data', data => {
      stdout = stdout.concat(data);
    });
    process.stderr?.on('data', data => {
      stderr = stderr.concat(data);
    });
    process.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`process failed: ${stderr}`));
      }
      resolve({ stdout, stderr });
    });
  });
};

export function createYqAction({ actionId }: { actionId?: string }) {
  return createTemplateAction<{
    path: string;
    query: string[] | string;
    writeOutputPath?: string;
  }>({
    id: actionId || 'roadiehq:utils:yq',
    description: 'Allows using yq syntax on a file in the workspace.',
    schema: {
      input: {
        type: 'object',
        required: ['query', 'path'],
        properties: {
          path: {
            title: 'Path',
            description: 'Path read the file from.',
            type: 'string',
          },
          query: {
            description: 'Array of query items to run in jq.',
            title: 'Query',
            type: ['array', 'string'],
          },
          writeOutputPath: {
            description: 'Write the output of the query back to the file.',
            title: 'Write Output path',
            type: 'string',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          result: {
            title: 'Output',
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const messageSanitizer = createMessageSanitizer(ctx);
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );
      const queries = [ctx.input.query].flat();

      ctx.logger.info(`Attempting to yq with ${ctx.input.path}`);

      const writePath =
        ctx.input.writeOutputPath &&
        resolveSafeChildPath(ctx.workspacePath, ctx.input.writeOutputPath);
      if (!fs.existsSync(sourceFilepath)) {
        throw new Error(`${messageSanitizer(sourceFilepath)} does not exist`);
      }
      try {
        const initialResult = await execFilePromise('yq', [sourceFilepath]);
        let lastOutput = initialResult.stdout;
        for (const query of queries) {
          const process = execFile('yq', [query], {});
          process.stdin?.write(lastOutput);
          process.stdin?.end();
          const { stdout } = await wait(process);
          lastOutput = stdout;
        }
        if (lastOutput && writePath) {
          ctx.logger.info(`Writing yq output to ${ctx.input.writeOutputPath}`);

          fs.writeFileSync(writePath, lastOutput);
        }

        ctx.output('result', lastOutput);
      } catch (e: any) {
        throw new Error(messageSanitizer(e.message));
      }
    },
  });
}
