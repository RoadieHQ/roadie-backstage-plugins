/*
 * Copyright 2025 Larder Software Limited
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
  resolveSafeChildPath,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import {
  ScmIntegrationRegistry,
  ScmIntegrations,
} from '@backstage/integration';
import {
  createTemplateAction,
  fetchContents,
  TemplateActionOptions,
  TemplateFilter,
  TemplateGlobal,
} from '@backstage/plugin-scaffolder-node';
import { examples } from './fetchTemplatePlus.examples';
import { createTemplateActionHandler } from './templateActionHandler';

type InputSchemaFields = NonNullable<
  NonNullable<TemplateActionOptions['schema']>['input']
>;

type ZodImpl = Parameters<InputSchemaFields[string]>[0];

const templateEntrySchema = (z: ZodImpl) =>
  z.object({
    url: z
      .string()
      .optional()
      .describe(
        'Relative path or absolute URL pointing to the directory tree to fetch.',
      ),
    targetPath: z
      .string()
      .optional()
      .describe(
        'Target path within the working directory to download the contents to. Defaults to the working directory root.',
      ),
    values: z
      .record(z.any())
      .optional()
      .describe('Values to pass on to the templating engine.'),
    copyWithoutRender: z
      .array(z.string())
      .optional()
      .describe(
        'An array of glob patterns. Any files or directories which match are copied without being processed as templates.',
      ),
    copyWithoutTemplating: z
      .array(z.string())
      .optional()
      .describe(
        'An array of glob patterns. Contents of matched files or directories are copied without being processed, but paths are subject to rendering.',
      ),
    cookiecutterCompat: z
      .boolean()
      .optional()
      .describe(
        'Enable features to maximise compatibility with templates built for fetch:cookiecutter.',
      ),
    templateFileExtension: z
      .union([z.string(), z.boolean()])
      .optional()
      .describe(
        'If set, only files with the given extension will be templated. If set to `true`, the default extension `.njk` is used.',
      ),
    replace: z
      .boolean()
      .optional()
      .describe(
        'If set, replace files in targetPath instead of skipping existing ones.',
      ),
    trimBlocks: z
      .boolean()
      .optional()
      .describe(
        'If set, the first newline after a block is removed (block, not variable tag).',
      ),
    lstripBlocks: z
      .boolean()
      .optional()
      .describe(
        'If set, leading spaces and tabs are stripped from the start of a line to a block.',
      ),
    token: z
      .string()
      .optional()
      .describe(
        'An optional token to use for authentication when reading the resources.',
      ),
    skipIf: z
      .boolean()
      .optional()
      .describe('If set, this entry is skipped without being fetched.'),
    ignoreErrors: z
      .boolean()
      .optional()
      .describe(
        'If set, a failure for this entry is logged and the remaining entries still run.',
      ),
  });

type TemplateEntry = {
  url?: string;
  targetPath?: string;
  values?: Record<string, any>;
  copyWithoutRender?: string[];
  copyWithoutTemplating?: string[];
  cookiecutterCompat?: boolean;
  templateFileExtension?: string | boolean;
  replace?: boolean;
  trimBlocks?: boolean;
  lstripBlocks?: boolean;
  token?: string;
  skipIf?: boolean;
  ignoreErrors?: boolean;
};

type ResolvedTemplateEntry = Omit<TemplateEntry, 'url' | 'values'> & {
  url: string;
  values: Record<string, any>;
};

type TemplateEntryResult = {
  url: string;
  targetPath: string;
  status: 'completed' | 'skipped' | 'failed';
  error?: string;
};

function resolveEntry(
  entry: TemplateEntry,
  commonParams: TemplateEntry | undefined,
  index: number,
): ResolvedTemplateEntry {
  const merged = {
    ...commonParams,
    ...entry,
    values: { ...commonParams?.values, ...entry.values },
  };

  if (!merged.url) {
    throw new InputError(
      `templates[${index}] is missing a url, provide one on the entry or in commonParams`,
    );
  }

  return {
    ...merged,
    url: merged.url,
    targetPath: merged.targetPath?.trim(),
  };
}

export function createFetchTemplatePlusAction(options: {
  reader: UrlReaderService;
  integrations: ScmIntegrationRegistry;
  additionalTemplateFilters?: Record<string, TemplateFilter>;
  additionalTemplateGlobals?: Record<string, TemplateGlobal>;
}) {
  const { reader, integrations } = options;

  const renderEntry = createTemplateActionHandler<ResolvedTemplateEntry>({
    resolveTemplate: async ctx => {
      const workDir = await ctx.createTemporaryDirectory();
      const templateDir = resolveSafeChildPath(workDir, 'template');

      await fetchContents({
        baseUrl: ctx.templateInfo?.baseUrl,
        fetchUrl: ctx.input.url,
        outputPath: templateDir,
        token: ctx.input.token,
        reader,
        integrations: integrations as ScmIntegrations,
      });

      return templateDir;
    },
    ...options,
  });

  return createTemplateAction({
    id: 'fetch:template:plus',
    description:
      'Downloads and templates any number of skeletons in a single step. Each entry in `templates` takes the same options as `fetch:template`, and `commonParams` supplies defaults shared by every entry.',
    examples,
    schema: {
      input: {
        commonParams: z =>
          templateEntrySchema(z)
            .optional()
            .describe(
              'Defaults applied to every entry in `templates`. Entry level fields take precedence, and `values` from both are merged.',
            ),
        templates: z =>
          templateEntrySchema(z)
            .array()
            .describe('The skeletons to fetch and template, in order.'),
      },
      output: {
        results: z =>
          z
            .array(
              z.object({
                url: z.string(),
                targetPath: z.string(),
                status: z.enum(['completed', 'skipped', 'failed']),
                error: z.string().optional(),
              }),
            )
            .describe('The outcome of each entry, in the order they appear.'),
      },
    },
    supportsDryRun: true,
    async handler(ctx) {
      const { commonParams, templates } = ctx.input;
      const results: TemplateEntryResult[] = [];

      for (const [index, entry] of templates.entries()) {
        const resolved = resolveEntry(entry, commonParams, index);
        const targetPath = resolved.targetPath ?? './';

        if (resolved.skipIf) {
          ctx.logger.info(
            `Skipping templates[${index}] '${resolved.url}' because skipIf is set`,
          );
          results.push({ url: resolved.url, targetPath, status: 'skipped' });
          continue;
        }

        ctx.logger.info(
          `Fetching templates[${index}] from '${resolved.url}' into '${targetPath}'`,
        );

        try {
          await renderEntry({ ...ctx, input: resolved });
          results.push({ url: resolved.url, targetPath, status: 'completed' });
        } catch (error) {
          if (!resolved.ignoreErrors) {
            throw error;
          }

          const message = error instanceof Error ? error.message : `${error}`;
          ctx.logger.warn(
            `Ignoring failure for templates[${index}] '${resolved.url}': ${message}`,
          );
          results.push({
            url: resolved.url,
            targetPath,
            status: 'failed',
            error: message,
          });
        }
      }

      ctx.output('results', results);
    },
  });
}
