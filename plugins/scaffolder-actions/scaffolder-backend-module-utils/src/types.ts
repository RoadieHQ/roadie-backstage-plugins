/*
 * Copyright 2023 Larder Software Limited
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

import { DumpOptions } from 'js-yaml';

export type supportedDumpOptions = Omit<
  DumpOptions,
  'styles' | 'schema' | 'replacer'
>;

export const yamlOptionsSchema = {
  title: 'Options',
  description: 'YAML stringify options',
  type: 'object',
  properties: {
    indent: {
      type: 'number',
    },
    noArrayIndent: {
      type: 'boolean',
    },
    skipInvalid: {
      type: 'boolean',
    },
    flowLevel: {
      type: 'number',
    },
    sortKeys: {
      type: 'boolean',
    },
    lineWidth: {
      type: 'number',
    },
    noRefs: {
      type: 'boolean',
    },
    noCompatMode: {
      type: 'boolean',
    },
    condenseFlow: {
      type: 'boolean',
    },
    quotingType: {
      type: 'string',
    },
    forceQuotes: {
      type: 'boolean',
    },
  },
};
