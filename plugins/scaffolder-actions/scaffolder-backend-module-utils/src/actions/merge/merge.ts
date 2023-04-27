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
import { resolveSafeChildPath } from '@backstage/backend-common';
import fs from 'fs-extra';
import { extname } from 'path';
import { merge } from 'lodash';
import yaml from 'js-yaml';
import { supportedDumpOptions, yamlOptionsSchema } from '../../types';

export function createMergeJSONAction({ actionId }: { actionId?: string }) {
  return createTemplateAction<{ path: string; content: any }>({
    id: actionId || 'roadiehq:utils:json:merge',
    description: 'Merge new data into an existing JSON file.',
    supportsDryRun: true,
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
            description:
              'This will be merged into to the file. Can be either an object or a string.',
            title: 'Content',
            type: ['string', 'object'],
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

      let existingContent;

      if (fs.existsSync(sourceFilepath)) {
        existingContent = JSON.parse(
          fs.readFileSync(sourceFilepath).toString(),
        );
      } else {
        ctx.logger.info(
          `The file ${sourceFilepath} does not exist, creating it.`,
        );
        existingContent = {};
      }
      const content =
        typeof ctx.input.content === 'string'
          ? JSON.parse(ctx.input.content)
          : ctx.input.content;

      fs.writeFileSync(
        sourceFilepath,
        JSON.stringify(merge(existingContent, content), null, 2),
      );
      ctx.output('path', sourceFilepath);
    },
  });
}

export function createMergeAction() {
  return createTemplateAction<{
    path: string;
    content: any;
    options?: supportedDumpOptions;
  }>({
    id: 'roadiehq:utils:merge',
    description: 'Merges data into an existing structured file.',
    supportsDryRun: true,
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
            description:
              'This will be merged into to the file. Can be either an object or a string.',
            title: 'Content',
            type: ['string', 'object'],
          },
          options: {
            ...yamlOptionsSchema,
            description: `${yamlOptionsSchema.description}  (for YAML output only)`,
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

      if (!fs.existsSync(sourceFilepath)) {
        ctx.logger.error(`The file ${sourceFilepath} does not exist.`);
        throw new Error(`The file ${sourceFilepath} does not exist.`);
      }
      const originalContent = fs.readFileSync(sourceFilepath).toString();
      let mergedContent;

      switch (extname(sourceFilepath)) {
        case '.json': {
          const newContent =
            typeof ctx.input.content === 'string'
              ? JSON.parse(ctx.input.content)
              : ctx.input.content; // This supports the case where dynamic keys are required
          mergedContent = JSON.stringify(
            merge(JSON.parse(originalContent), newContent),
            null,
            2,
          );
          break;
        }
        case '.yml':
        case '.yaml': {
          const newContent =
            typeof ctx.input.content === 'string'
              ? yaml.load(ctx.input.content)
              : ctx.input.content; // This supports the case where dynamic keys are required
          mergedContent = yaml.dump(
            merge(yaml.load(originalContent), newContent),
            ctx.input.options,
          );
          break;
        }
        default:
          break;
      }
      if (!mergedContent) {
        return;
      }
      fs.writeFileSync(sourceFilepath, mergedContent);
      ctx.output('path', sourceFilepath);
    },
  });
}
