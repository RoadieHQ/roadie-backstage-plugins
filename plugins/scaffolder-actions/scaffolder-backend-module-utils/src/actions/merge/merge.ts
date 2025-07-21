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
import { extname } from 'path';
import { isArray, isNull, mergeWith } from 'lodash';
import YAML, { Document } from 'yaml';
import YAWN from 'yawn-yaml';
import { yamlOptionsSchema } from '../../types';
import detectIndent from 'detect-indent';

function mergeArrayCustomiser(objValue: string | any[], srcValue: any) {
  if (isArray(objValue) && !isNull(objValue)) {
    return Array.from(new Set(objValue.concat(srcValue)));
  }
  return undefined;
}

const existPathInObject = (object: any, path: string, value: string) => {
  const keys = path.split('.');
  if (typeof object !== 'object') {
    return false;
  }

  let current = object;
  for (const key of keys) {
    if (current[key] === undefined) {
      current = undefined;
      break;
    }
    current = current[key];
  }
  return current?.toString() === value;
};

export function createMergeJSONAction({ actionId }: { actionId?: string }) {
  return createTemplateAction({
    id: actionId || 'roadiehq:utils:json:merge',
    description: 'Merge new data into an existing JSON file.',
    supportsDryRun: true,
    schema: {
      input: {
        path: z => z.string().describe('Path to existing file to append.'),
        content: z =>
          z
            .union([z.string(), z.record(z.any())])
            .describe(
              'This will be merged into to the file. Can be either an object or a string.',
            ),
        mergeArrays: z =>
          z
            .boolean()
            .describe(
              'Where a value is an array the merge function should concatenate the provided array value with the target array',
            )
            .optional(),
        matchFileIndent: z =>
          z
            .boolean()
            .describe(
              'Make the output file indentation match that of the specified input file.',
            )
            .optional(),
      },
      output: {
        path: z => z.string().describe('Path to the file that was written'),
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

      let fileIndent = 2;
      if (ctx.input.matchFileIndent) {
        fileIndent = detectIndent(
          fs.readFileSync(sourceFilepath, 'utf8'),
        ).amount;
        if (!fileIndent) {
          fileIndent = 2;
          ctx.logger.info(
            `Failed to detect source file indentation, using default value of 2.`,
          );
        }
      }
      fs.writeFileSync(
        sourceFilepath,
        JSON.stringify(
          mergeWith(
            existingContent,
            content,
            ctx.input.mergeArrays ? mergeArrayCustomiser : undefined,
          ),
          null,
          fileIndent,
        ),
      );
      ctx.output('path', sourceFilepath);
    },
  });
}

export function createMergeAction() {
  return createTemplateAction({
    id: 'roadiehq:utils:merge',
    description: 'Merges data into an existing structured file.',
    supportsDryRun: true,
    schema: {
      input: {
        path: z => z.string().describe('Path to existing file to append.'),
        content: z =>
          z
            .union([z.string(), z.record(z.any())])
            .describe(
              'This will be merged into to the file. Can be either an object or a string.',
            ),
        mergeArrays: z =>
          z
            .boolean()
            .describe(
              'Where a value is an array the merge function should concatenate the provided array value with the target array',
            )
            .optional(),
        preserveYamlComments: z =>
          z
            .boolean()
            .describe(
              'Will preserve standalone and inline comments in YAML files',
            )
            .optional(),
        useDocumentIncludingField: z =>
          z
            .object({
              key: z
                .string()
                .describe(
                  'The key of the field to use to find the document to merge into.',
                ),
              value: z
                .string()
                .describe(
                  'The value of the field to use to find the document to merge into.',
                ),
            })
            .describe(
              'This option is only applicable to YAML files. It allows you to specify a field to use as a key to find the document to merge into.',
            )
            .optional(),
        options: yamlOptionsSchema,
      },
      output: {
        path: z => z.string().describe('Path to the file that was written'),
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
            mergeWith(
              YAML.parse(originalContent),
              newContent,
              ctx.input.mergeArrays ? mergeArrayCustomiser : undefined,
            ),
            null,
            2,
          );
          break;
        }
        case '.yml':
        case '.yaml':
          {
            const newContent =
              typeof ctx.input.content === 'string'
                ? YAML.parse(ctx.input.content)
                : ctx.input.content; // This supports the case where dynamic keys are required
            if (ctx.input.preserveYamlComments) {
              mergedContent = mergeContentPreserveComments(
                originalContent,
                newContent,
                ctx,
              )
                .map(doc => YAML.stringify(doc, ctx.input.options))
                .join('---\n');
            } else {
              mergedContent = mergeDocumentsRemovingComments(
                originalContent,
                newContent,
                ctx,
              )
                .map(doc => YAML.stringify(doc, ctx.input.options))
                .join('---\n');
            }
          }
          break;
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

function mergeDocumentsRemovingComments(
  originalContent: string,
  newContent: any,
  ctx: any,
): Document[] {
  const documents = YAML.parseAllDocuments(originalContent);
  checkDocumentExists(ctx, documents);
  if (documents.length === 1) {
    return [
      mergeWith(
        documents[0].toJSON(),
        newContent,
        ctx.input.mergeArrays ? mergeArrayCustomiser : undefined,
      ),
    ];
  }
  checkUseDocumentIncludingFieldSet(ctx);
  const { key, value } = ctx.input.useDocumentIncludingField;
  return documents.map((document: Document) => {
    let includingField = document.get(key);
    if (typeof includingField === 'number') {
      includingField = includingField.toString();
    }
    if (typeof includingField !== 'string') {
      ctx.logger.error(
        `The value at "${key}" defined in useDocumentIncludingField must be a string or a number.`,
      );
      throw new Error(
        `The value at "${key}" defined in useDocumentIncludingField must be a string or a number.`,
      );
    }
    if ((includingField as string) === value) {
      return mergeWith(
        document.toJSON(),
        newContent,
        ctx.input.mergeArrays ? mergeArrayCustomiser : undefined,
      );
    }
    return document.toJSON();
  });
}

function mergeContentPreserveComments(
  originalContent: string,
  newContent: any,
  ctx: any,
): Document[] {
  const yawns = splitYaml(originalContent).map(
    (document: string) => new YAWN(document),
  );
  checkDocumentExists(ctx, yawns);
  if (yawns.length === 1) {
    return [
      YAML.parseDocument(
        mergeYawn(yawns[0], newContent, ctx.input.mergeArrays).yaml,
      ),
    ];
  }
  checkUseDocumentIncludingFieldSet(ctx);
  const { key, value } = ctx.input.useDocumentIncludingField;
  return yawns.map((yawn: YAWN) =>
    YAML.parseDocument(
      existPathInObject(yawn.json, key, value)
        ? mergeYawn(yawn, newContent, ctx.input.mergeArrays).yaml
        : yawn.yaml,
    ),
  );
}

function checkDocumentExists(ctx: any, documents: any[]) {
  if (documents.length === 0) {
    ctx.logger.error(
      `No documents found in the input content. Please provide a valid YAML file.`,
    );
    throw new Error(
      `No documents found in the input content. Please provide a valid YAML file.`,
    );
  }
}

function checkUseDocumentIncludingFieldSet(ctx: any) {
  if (!ctx.input.useDocumentIncludingField) {
    ctx.logger.error(
      `Multiple documents found in the input content. Please provide a key and value to use to find the document to merge into.`,
    );
    throw new Error(
      `Multiple documents found in the input content. Please provide a key and value to use to find the document to merge into.`,
    );
  }
}

function mergeYawn(
  yawn: YAWN,
  newContent: any,
  mergeArrays: boolean | undefined,
) {
  const parsedOriginal = yawn.json;
  yawn.json = mergeWith(
    parsedOriginal,
    newContent,
    mergeArrays ? mergeArrayCustomiser : undefined,
  );
  return yawn;
}

function splitYaml(originalContent: string): string[] {
  return originalContent.split(/^---\s*$/m).filter(doc => doc.trim() !== '');
}
