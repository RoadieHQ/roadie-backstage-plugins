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
  'styles' | 'schema' | 'replacer' | 'sortKeys'
>;

export const yamlOptionsSchema = {
  title: 'Options',
  description: 'YAML stringify options',
  type: 'object',
  properties: {
    indent: {
      description: '(default: 2) - indentation width to use (in spaces)',
      type: 'number',
    },
    noArrayIndent: {
      description:
        '(default: false) - when true, will not add an indentation level to array elements',
      type: 'boolean',
    },
    skipInvalid: {
      description:
        '(default: false) - do not throw on invalid types (like function in the safe schema) and skip pairs and single values with such types',
      type: 'boolean',
    },
    flowLevel: {
      description:
        '(default: -1) - specifies level of nesting, when to switch from block to flow style for collections. -1 means block style everwhere',
      type: 'number',
    },
    sortKeys: {
      description:
        '(default: false) - if true, sort keys when dumping YAML. If a function, use the function to sort the keys',
      type: 'boolean',
    },
    lineWidth: {
      description:
        '(default: 80) - set max line width. Set -1 for unlimited width',
      type: 'number',
    },
    noRefs: {
      description:
        "(default: false) - if true, don't convert duplicate objects into references",
      type: 'boolean',
    },
    noCompatMode: {
      description:
        '(default: false) - if true don\'t try to be compatible with older yaml versions. Currently: don\'t quote "yes", "no" and so on, as required for YAML 1.1',
      type: 'boolean',
    },
    condenseFlow: {
      description:
        "(default: false) - if true flow sequences will be condensed, omitting the space between a, b. Eg. '[a,b]', and omitting the space between key: value and quoting the key. Eg. '{\"a\":b}' Can be useful when using yaml for pretty URL query params as spaces are %-encoded.",
      type: 'boolean',
    },
    quotingType: {
      description:
        "(' or \", default: ') - strings will be quoted using this quoting style. If you specify single quotes, double quotes will still be used for non-printable characters.",
      type: 'string',
    },
    forceQuotes: {
      description:
        "(default: false) - if true, all non-key strings will be quoted even if they normally don't need to.",
      type: 'boolean',
    },
  },
};
