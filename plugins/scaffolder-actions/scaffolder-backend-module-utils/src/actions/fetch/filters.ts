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
import { ScmIntegrationRegistry } from '@backstage/integration';
import { parseEntityRef as catalogParseEntityRef } from '@backstage/catalog-model';
import { TemplateFilter } from '@backstage/plugin-scaffolder-node';
import { JsonValue } from '@backstage/types';

/**
 * Creates the parseRepoUrl filter
 */
function createParseRepoUrl(
  integrations: ScmIntegrationRegistry,
): TemplateFilter {
  return (input: JsonValue) => {
    if (typeof input !== 'string') {
      throw new Error(`parseRepoUrl expects a string, got ${typeof input}`);
    }
    let url: URL;
    try {
      url = new URL(input);
    } catch {
      throw new Error(`Invalid repo URL: ${input}`);
    }

    const integration = integrations.byUrl(url);
    if (!integration) {
      throw new Error(`No integration found for URL: ${input}`);
    }

    const host = url.host;
    const pathname = url.pathname.replace(/^\//, '').replace(/\/$/, '');
    const parts = pathname.split('/');

    return {
      host,
      owner: parts[0] || '',
      repo: parts[1]?.replace(/\.git$/, '') || '',
    };
  };
}

/**
 * parseEntityRef filter - parses entity reference strings
 */
const parseEntityRef: TemplateFilter = (input: JsonValue) => {
  if (typeof input !== 'string') {
    throw new Error(`parseEntityRef expects a string, got ${typeof input}`);
  }
  return catalogParseEntityRef(input);
};

/**
 * pick filter - picks properties from an object
 */
const pick: TemplateFilter = (input: JsonValue, key: JsonValue) => {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return undefined;
  }
  if (typeof key !== 'string') {
    return undefined;
  }
  return (input as Record<string, JsonValue>)[key];
};

/**
 * Creates the projectSlug filter
 */
function createProjectSlug(
  integrations: ScmIntegrationRegistry,
): TemplateFilter {
  return (input: JsonValue) => {
    if (typeof input !== 'string') {
      throw new Error(`projectSlug expects a string, got ${typeof input}`);
    }
    let url: URL;
    try {
      url = new URL(input);
    } catch {
      throw new Error(`Invalid repo URL: ${input}`);
    }

    const integration = integrations.byUrl(url);
    if (!integration) {
      throw new Error(`No integration found for URL: ${input}`);
    }

    const pathname = url.pathname.replace(/^\//, '').replace(/\/$/, '');
    const parts = pathname.split('/');
    const owner = parts[0] || '';
    const repo = parts[1]?.replace(/\.git$/, '') || '';

    return `${owner}/${repo}`;
  };
}

/**
 * Creates the default set of template filters
 */
export function createDefaultFilters(options: {
  integrations: ScmIntegrationRegistry;
}): Record<string, TemplateFilter> {
  return {
    parseRepoUrl: createParseRepoUrl(options.integrations),
    parseEntityRef,
    pick,
    projectSlug: createProjectSlug(options.integrations),
  };
}
