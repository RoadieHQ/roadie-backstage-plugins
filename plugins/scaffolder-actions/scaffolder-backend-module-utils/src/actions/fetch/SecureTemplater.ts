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
  createTemplateRenderer,
  PreparedTemplateContext,
  TemplateContext,
  TemplateFilter as RendererFilter,
  TemplateGlobal as RendererGlobal,
} from 'nunjitsu';
import {
  TemplateFilter,
  TemplateGlobal,
} from '@backstage/plugin-scaffolder-node';

interface SecureTemplaterOptions {
  /* Enables jinja compatibility and the "jsonify" filter */
  cookiecutterCompat?: boolean;
  /* Extra user-provided nunjucks filters */
  templateFilters?: Record<string, TemplateFilter>;
  /* Extra user-provided nunjucks globals */
  templateGlobals?: Record<string, TemplateGlobal>;
  nunjucksConfigs?: { trimBlocks?: boolean; lstripBlocks?: boolean };
}

export type SecureTemplateRenderer = (
  template: string,
  values: unknown,
) => string;

/**
 * Renders templates with nunjitsu, the sandboxed template engine used by the
 * upstream Backstage scaffolder. Templates cannot reach host objects or run
 * arbitrary code; filters and globals are the only capabilities exposed, and
 * renders are bounded by nunjitsu's resource limits.
 */
export class SecureTemplater {
  static async loadRenderer(
    options: SecureTemplaterOptions = {},
  ): Promise<SecureTemplateRenderer> {
    const {
      cookiecutterCompat,
      templateFilters = {},
      templateGlobals = {},
      nunjucksConfigs = {},
    } = options;

    // Wrap capabilities the same way the upstream scaffolder does, so the
    // renderer only ever sees plain functions rather than the host objects.
    const filters: Record<string, RendererFilter> = {};
    for (const [name, filter] of Object.entries(templateFilters)) {
      filters[name] = (input, ...args) =>
        filter(input as any, ...(args as any[])) as any;
    }
    const globals: Record<string, RendererGlobal> = {};
    for (const [name, global] of Object.entries(templateGlobals)) {
      globals[name] =
        typeof global === 'function'
          ? (...args) => global(...(args as any[])) as any
          : (global as RendererGlobal);
    }

    const renderer = createTemplateRenderer({
      filters,
      globals,
      allowRegexExecution: true,
      cookiecutterCompat,
      trimBlocks: nunjucksConfigs.trimBlocks,
      lstripBlocks: nunjucksConfigs.lstripBlocks,
    });

    // Callers reuse one context object for every file, so copy and validate
    // it once rather than on every render.
    const prepared = new WeakMap<object, PreparedTemplateContext>();
    const prepare = (values: unknown) => {
      if (typeof values !== 'object' || values === null) {
        return renderer.prepareContext(values as TemplateContext);
      }
      let context = prepared.get(values);
      if (!context) {
        context = renderer.prepareContext(values as TemplateContext);
        prepared.set(values, context);
      }
      return context;
    };

    return (template, values) => {
      try {
        return renderer.render(template, prepare(values));
      } catch (error) {
        throw new Error(String((error as Error).message));
      }
    };
  }
}
