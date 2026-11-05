/*
 * Copyright 2021 The Backstage Authors
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

// eslint-disable-next-line notice/notice
import {
  resolveSafeChildPath,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import {
  ScmIntegrationRegistry,
  ScmIntegrations,
} from '@backstage/integration';
import {
  createTemplateAction,
  fetchContents,
  TemplateFilter,
  TemplateGlobal,
} from '@backstage/plugin-scaffolder-node';
import { examples } from './template.examples';
import { createTemplateActionHandler } from './templateActionHandler';
import { debugFetch, DebugFetchResult } from './debugUrlReader';
import { createInstrumentedReader } from './instrumentedUrlReader';

export function createFetchTemplateDebugAction(options: {
  reader: UrlReaderService;
  integrations: ScmIntegrationRegistry;
  additionalTemplateFilters?: Record<string, TemplateFilter>;
  additionalTemplateGlobals?: Record<string, TemplateGlobal>;
}) {
  const { reader, integrations } = options;

  return createTemplateAction({
    id: 'fetch:template:debug',
    description:
      'Downloads a skeleton, templates variables into file and directory names and content, and places the result in the workspace, or optionally in a subdirectory specified by the `targetPath` input option.',
    examples,
    schema: {
      input: {
        url: z =>
          z.string({
            description:
              'Relative path or absolute URL pointing to the directory tree to fetch',
          }),
        targetPath: z =>
          z
            .string({
              description:
                'Target path within the working directory to download the contents to. Defaults to the working directory root.',
            })
            .optional(),
        values: z =>
          z
            .record(z.any(), {
              description: 'Values to pass on to the templating engine',
            })
            .optional(),
        copyWithoutRender: z =>
          z
            .array(z.string(), {
              description:
                'An array of glob patterns. Any files or directories which match are copied without being processed as templates.',
            })
            .optional(),
        copyWithoutTemplating: z =>
          z
            .array(z.string(), {
              description:
                'An array of glob patterns. Contents of matched files or directories are copied without being processed, but paths are subject to rendering.',
            })
            .optional(),
        cookiecutterCompat: z =>
          z
            .boolean({
              description:
                'Enable features to maximise compatibility with templates built for fetch:cookiecutter',
            })
            .optional(),
        templateFileExtension: z =>
          z
            .union([z.string(), z.boolean()], {
              description:
                'If set, only files with the given extension will be templated. If set to `true`, the default extension `.njk` is used.',
            })
            .optional(),
        replace: z =>
          z
            .boolean({
              description:
                'If set, replace files in targetPath instead of skipping existing ones.',
            })
            .optional(),
        trimBlocks: z =>
          z
            .boolean({
              description:
                'If set, the first newline after a block is removed (block, not variable tag).',
            })
            .optional(),
        lstripBlocks: z =>
          z
            .boolean({
              description:
                'If set, leading spaces and tabs are stripped from the start of a line to a block.',
            })
            .optional(),
        token: z =>
          z
            .string({
              description:
                'An optional token to use for authentication when reading the resources.',
            })
            .optional(),
      },
    },
    supportsDryRun: true,
    handler: createTemplateActionHandler<{
      url: string;
      token?: string;
      targetPath?: string;
      values: any;
      templateFileExtension?: string | boolean;
      copyWithoutRender?: string[];
      copyWithoutTemplating?: string[];
      cookiecutterCompat?: boolean;
      replace?: boolean;
      trimBlocks?: boolean;
      lstripBlocks?: boolean;
    }>({
      resolveTemplate: async ctx => {
        ctx.logger.info('Fetching template content from remote URL');

        let resolvedUrl = ctx.input.url;
        if (ctx.templateInfo?.baseUrl) {
          const integration = integrations.byUrl(ctx.templateInfo.baseUrl);
          if (integration) {
            resolvedUrl = integration.resolveUrl({
              url: ctx.input.url,
              base: ctx.templateInfo.baseUrl,
            });
          }
        }

        let debugResult: DebugFetchResult | undefined;
        try {
          debugResult = await debugFetch(resolvedUrl, ctx.logger, integrations);
        } catch (e) {
          ctx.logger.warn(
            `[DEBUG] Debug fetch failed: ${
              e instanceof Error ? e.message : String(e)
            }`,
          );
        }

        if (debugResult?.authFailureDetected) {
          ctx.logger.warn(
            `[DEBUG] Auth failure detected during pre-check (status codes: ${debugResult.failedStatusCodes.join(
              ', ',
            )}). Will retry fetch if it fails.`,
          );
        }

        const workDir = await ctx.createTemporaryDirectory();
        const templateDir = resolveSafeChildPath(workDir, 'template');

        const instrumentedReader = createInstrumentedReader(reader, ctx.logger);

        const maxAttempts = 3;
        const baseDelayMs = 5000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            await fetchContents({
              baseUrl: ctx.templateInfo?.baseUrl,
              fetchUrl: ctx.input.url,
              outputPath: templateDir,
              token: ctx.input.token,
              reader: instrumentedReader,
              integrations: integrations as ScmIntegrations,
            });
            if (attempt > 1) {
              ctx.logger.info(
                `Fetch succeeded on attempt ${attempt}/${maxAttempts}`,
              );
            }
            return templateDir;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);

            if (attempt < maxAttempts) {
              const delayMs = baseDelayMs * attempt;
              ctx.logger.warn(
                `Fetch attempt ${attempt}/${maxAttempts} failed: ${message}. Retrying in ${
                  delayMs / 1000
                }s...`,
              );
              await new Promise(resolve => setTimeout(resolve, delayMs));

              ctx.logger.info(
                `Re-running diagnostics before retry attempt ${attempt + 1}...`,
              );
              try {
                const retryDebug = await debugFetch(
                  resolvedUrl,
                  ctx.logger,
                  integrations,
                );
                if (retryDebug.authFailureDetected) {
                  ctx.logger.warn(
                    `Auth failure still detected before attempt ${
                      attempt + 1
                    } (status codes: ${retryDebug.failedStatusCodes.join(
                      ', ',
                    )})`,
                  );
                } else if (retryDebug.reachable) {
                  ctx.logger.info(
                    `Pre-retry diagnostics look healthy, proceeding with attempt ${
                      attempt + 1
                    }`,
                  );
                }
              } catch (e) {
                ctx.logger.warn(
                  `Pre-retry diagnostics failed: ${
                    e instanceof Error ? e.message : String(e)
                  }`,
                );
              }
            } else {
              ctx.logger.error(
                `All ${maxAttempts} fetch attempts failed. Last error: ${message}`,
              );
              throw error;
            }
          }
        }

        return templateDir;
      },
      debug: true,
      ...options,
    }),
  });
}
