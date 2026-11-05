/*
 * Copyright 2025 The Backstage Authors
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
  isChildPath,
  resolveSafeChildPath,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { ScmIntegrationRegistry } from '@backstage/integration';
import {
  ActionContext,
  TemplateActionOptions,
  TemplateFilter,
  TemplateGlobal,
} from '@backstage/plugin-scaffolder-node';
import fs from 'fs-extra';
import globby from 'globby';
import { isBinaryFile } from 'isbinaryfile';
import { createDefaultFilters } from './filters';
import { SecureTemplater } from './SecureTemplater';
import { extname } from 'path';

export type TemplateActionInput = {
  targetPath?: string;
  values: any;
  templateFileExtension?: string | boolean;

  // Cookiecutter compat options
  /**
   * @deprecated This field is deprecated in favor of copyWithoutTemplating.
   */
  copyWithoutRender?: string[];
  copyWithoutTemplating?: string[];
  cookiecutterCompat?: boolean;
  replace?: boolean;
  trimBlocks?: boolean;
  lstripBlocks?: boolean;
};

export function createTemplateActionHandler<
  I extends TemplateActionInput = TemplateActionInput,
>(options: {
  resolveTemplate: (ctx: ActionContext<I, any, any>) => Promise<string>;
  integrations: ScmIntegrationRegistry;
  additionalTemplateFilters?: Record<string, TemplateFilter>;
  additionalTemplateGlobals?: Record<string, TemplateGlobal>;
  debug?: boolean;
}): TemplateActionOptions<I>['handler'] {
  const {
    resolveTemplate,
    integrations,
    additionalTemplateFilters,
    additionalTemplateGlobals: templateGlobals,
    debug = false,
  } = options;

  const templateFilters = {
    ...createDefaultFilters({ integrations }),
    ...additionalTemplateFilters,
  };

  return async (ctx: ActionContext<I, any, any>) => {
    if (debug) {
      ctx.logger.info('Resolving template action settings', {
        targetPath: ctx.input.targetPath,
        templateFileExtension: ctx.input.templateFileExtension,
        copyWithoutRender: ctx.input.copyWithoutRender,
        copyWithoutTemplating: ctx.input.copyWithoutTemplating,
        cookiecutterCompat: ctx.input.cookiecutterCompat,
        replace: ctx.input.replace,
        trimBlocks: ctx.input.trimBlocks,
        lstripBlocks: ctx.input.lstripBlocks,
      });
    }

    const { outputDir, copyOnlyPatterns, renderFilename, extension } =
      resolveTemplateActionSettings(ctx);

    if (debug) {
      ctx.logger.info('Template action settings resolved', {
        outputDir,
        copyOnlyPatterns,
        renderFilename,
        extension,
      });
      ctx.logger.info('Resolving template directory');
    }

    const templateDir = await resolveTemplate(ctx);

    if (debug) {
      ctx.logger.info('Template directory resolved', { templateDir });
    }

    if (isChildPath(templateDir, outputDir)) {
      if (debug) {
        ctx.logger.error(
          'Invalid path configuration: targetPath is within template path',
          {
            templateDir,
            outputDir,
          },
        );
      }
      throw new InputError('targetPath must not be within template path');
    }

    ctx.logger.info('Listing files and directories in template');
    const allEntriesInTemplate = await globby(`**/*`, {
      cwd: templateDir,
      dot: true,
      onlyFiles: false,
      markDirectories: true,
      followSymbolicLinks: false,
    });

    if (debug) {
      ctx.logger.info('Found template entries', {
        count: allEntriesInTemplate.length,
        entries: allEntriesInTemplate,
      });
      ctx.logger.info('Resolving non-templated entries', { copyOnlyPatterns });
    }

    const nonTemplatedEntries = new Set(
      await globby(copyOnlyPatterns || [], {
        cwd: templateDir,
        dot: true,
        onlyFiles: false,
        markDirectories: true,
        followSymbolicLinks: false,
      }),
    );

    if (debug) {
      ctx.logger.info('Non-templated entries resolved', {
        count: nonTemplatedEntries.size,
        entries: Array.from(nonTemplatedEntries),
      });
    }

    const { cookiecutterCompat, values } = ctx.input;
    const context = {
      [cookiecutterCompat ? 'cookiecutter' : 'values']: values,
    };

    if (debug) {
      ctx.logger.info('Template context prepared', {
        cookiecutterCompat,
        contextKey: cookiecutterCompat ? 'cookiecutter' : 'values',
        values: ctx.input.values,
      });
    }

    ctx.logger.info(
      `Processing ${allEntriesInTemplate.length} template files/directories with input values`,
      ctx.input.values,
    );

    if (debug) {
      ctx.logger.info('Loading SecureTemplater renderer', {
        cookiecutterCompat: ctx.input.cookiecutterCompat,
        templateFiltersCount: Object.keys(templateFilters).length,
        templateFilters: Object.keys(templateFilters),
        templateGlobalsCount: templateGlobals
          ? Object.keys(templateGlobals).length
          : 0,
        templateGlobals: templateGlobals ? Object.keys(templateGlobals) : [],
        trimBlocks: ctx.input.trimBlocks,
        lstripBlocks: ctx.input.lstripBlocks,
      });
    }

    const renderTemplate = await SecureTemplater.loadRenderer({
      cookiecutterCompat: ctx.input.cookiecutterCompat,
      templateFilters,
      templateGlobals,
      nunjucksConfigs: {
        trimBlocks: ctx.input.trimBlocks,
        lstripBlocks: ctx.input.lstripBlocks,
      },
    });

    if (debug) {
      ctx.logger.info('SecureTemplater renderer loaded successfully');
      ctx.logger.info('Starting to process template entries', {
        totalEntries: allEntriesInTemplate.length,
      });
    }

    for (const location of allEntriesInTemplate) {
      if (debug) {
        ctx.logger.debug('Processing entry', { location });
      }

      let renderContents: boolean;

      let localOutputPath = location;
      if (extension) {
        const hasExtension = extname(localOutputPath) === extension;
        renderContents = hasExtension;
        if (debug) {
          ctx.logger.debug('Extension mode: checking file extension', {
            location,
            extension,
            hasExtension,
            renderContents,
          });
        }
        if (renderContents) {
          localOutputPath = localOutputPath.slice(0, -extension.length);
          if (debug) {
            ctx.logger.debug('Stripped extension from output path', {
              originalPath: location,
              strippedPath: localOutputPath,
            });
          }
        }
        const originalPath = localOutputPath;
        localOutputPath = renderTemplate(localOutputPath, context);
        if (debug) {
          ctx.logger.debug('Rendered output path', {
            originalPath,
            renderedPath: localOutputPath,
          });
        }
      } else {
        const isNonTemplated = nonTemplatedEntries.has(location);
        renderContents = !isNonTemplated;
        if (debug) {
          ctx.logger.debug(
            'Standard mode: checking if entry should be templated',
            {
              location,
              isNonTemplated,
              renderContents,
              renderFilename,
            },
          );
        }
        if (renderFilename) {
          const originalPath = localOutputPath;
          localOutputPath = renderTemplate(localOutputPath, context);
          if (debug) {
            ctx.logger.debug('Rendered filename (renderFilename=true)', {
              originalPath,
              renderedPath: localOutputPath,
            });
          }
        } else {
          if (renderContents) {
            const originalPath = localOutputPath;
            localOutputPath = renderTemplate(localOutputPath, context);
            if (debug) {
              ctx.logger.debug('Rendered filename (renderContents=true)', {
                originalPath,
                renderedPath: localOutputPath,
              });
            }
          } else if (debug) {
            ctx.logger.debug('Keeping original filename (no rendering)', {
              localOutputPath,
            });
          }
        }
      }

      if (containsSkippedContent(localOutputPath)) {
        if (debug) {
          let skipReason = 'path contains //';
          if (localOutputPath === '') {
            skipReason = 'empty path';
          } else if (localOutputPath.startsWith('/')) {
            skipReason = 'path starts with /';
          }
          ctx.logger.debug('Skipping entry due to skipped content in path', {
            location,
            localOutputPath,
            reason: skipReason,
          });
        }
        continue;
      }

      const outputPath = resolveSafeChildPath(outputDir, localOutputPath);
      if (fs.existsSync(outputPath) && !ctx.input.replace) {
        if (debug) {
          ctx.logger.debug('Skipping entry: file exists and replace=false', {
            location,
            outputPath,
            replace: ctx.input.replace,
          });
        }
        continue;
      }

      if (!renderContents && !extension) {
        ctx.logger.info(
          `Copying file/directory ${location} without processing.`,
        );
      }

      if (location.endsWith('/')) {
        ctx.logger.info(
          `Writing directory ${location} to template output path.`,
        );
        await fs.ensureDir(outputPath);
      } else {
        const inputFilePath = resolveSafeChildPath(templateDir, location);
        if (debug) {
          ctx.logger.debug('Processing file', {
            location,
            inputFilePath,
            outputPath,
          });
        }

        const stats = await fs.promises.lstat(inputFilePath);
        const isSymlink = stats.isSymbolicLink();
        const isBinary = !isSymlink && (await isBinaryFile(inputFilePath));

        if (debug) {
          ctx.logger.debug('File stats', {
            location,
            isSymlink,
            isBinary,
            size: stats.size,
          });
        }

        if (isSymlink || isBinary) {
          ctx.logger.info(
            `Copying file binary or symbolic link at ${location}, to template output path.`,
          );
          await fs.copy(inputFilePath, outputPath);
        } else {
          const statsObj = await fs.stat(inputFilePath);
          ctx.logger.info(
            `Writing file ${location} to template output path with mode ${statsObj.mode}.`,
          );

          const inputFileContents = await fs.readFile(inputFilePath, 'utf-8');
          if (debug) {
            ctx.logger.debug('Read file contents', {
              location,
              contentLength: inputFileContents.length,
              contentPreview: inputFileContents.substring(0, 200),
            });
          }

          const outputContents = renderContents
            ? renderTemplate(inputFileContents, context)
            : inputFileContents;

          if (debug) {
            ctx.logger.debug('File contents prepared', {
              location,
              renderContents,
              inputLength: inputFileContents.length,
              outputLength: outputContents.length,
              wasModified: inputFileContents !== outputContents,
            });
          }

          await fs.outputFile(outputPath, outputContents, {
            mode: statsObj.mode,
          });
          if (debug) {
            ctx.logger.debug('File written', {
              location,
              outputPath,
              mode: statsObj.mode,
            });
          }
        }
      }
    }

    ctx.logger.info(`Template result written to ${outputDir}`);
  };
}

function resolveTemplateActionSettings<I extends TemplateActionInput>(
  ctx: ActionContext<I, any, any>,
): {
  outputDir: string;
  copyOnlyPatterns?: string[];
  renderFilename: boolean;
  extension: string | false;
} {
  const targetPath = ctx.input.targetPath ?? './';
  const outputDir = resolveSafeChildPath(ctx.workspacePath, targetPath);

  if (ctx.input.copyWithoutRender && ctx.input.copyWithoutTemplating) {
    throw new InputError(
      'Fetch action input copyWithoutRender and copyWithoutTemplating can not be used at the same time',
    );
  }
  let copyOnlyPatterns: string[] | undefined;
  let renderFilename: boolean;
  if (ctx.input.copyWithoutRender) {
    ctx.logger.warn(
      '[Deprecated] copyWithoutRender is deprecated Please use copyWithoutTemplating instead.',
    );
    copyOnlyPatterns = ctx.input.copyWithoutRender;
    renderFilename = false;
  } else {
    copyOnlyPatterns = ctx.input.copyWithoutTemplating;
    renderFilename = true;
  }
  if (copyOnlyPatterns && !Array.isArray(copyOnlyPatterns)) {
    throw new InputError(
      'Fetch action input copyWithoutRender/copyWithoutTemplating must be an Array',
    );
  }
  if (
    ctx.input.templateFileExtension &&
    (copyOnlyPatterns || ctx.input.cookiecutterCompat)
  ) {
    throw new InputError(
      'Fetch action input extension incompatible with copyWithoutRender/copyWithoutTemplating and cookiecutterCompat',
    );
  }
  let extension: string | false = false;
  if (ctx.input.templateFileExtension) {
    extension =
      ctx.input.templateFileExtension === true
        ? '.njk'
        : ctx.input.templateFileExtension;
    if (!extension.startsWith('.')) {
      extension = `.${extension}`;
    }
  }
  return {
    outputDir,
    copyOnlyPatterns,
    renderFilename,
    extension,
  };
}

function containsSkippedContent(localOutputPath: string): boolean {
  // if the path is empty means that there is a file skipped in the root
  // if the path starts with a separator it means that the root directory has been skipped
  // if the path includes // means that there is a subdirectory skipped
  // All paths returned are considered with / separator because of globby returning the linux separator for all os'.
  return (
    localOutputPath === '' ||
    localOutputPath.startsWith('/') ||
    localOutputPath.includes('//')
  );
}
