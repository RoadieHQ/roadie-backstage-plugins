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

import { ToStringOptions } from 'yaml';
import { z as zz } from 'zod';

export type stringifyOptions = Omit<ToStringOptions, 'commentString'>;

export const yamlOptionsSchema = (z: typeof zz) =>
  z
    .object({
      blockQuote: z
        .union([z.boolean(), z.literal('folded'), z.literal('literal')])
        .describe(
          '(default: true) - use block quote styles for scalar values where applicable',
        )
        .optional(),
      collectionStyle: z
        .union([z.literal('any'), z.literal('block'), z.literal('flow')])
        .describe(
          "(default: 'any') - enforce 'block' or 'flow' style on maps and sequences. By default, allows each collection to set its own flow: boolean property",
        )
        .optional(),
      defaultKeyType: z
        .union([
          z.literal('BLOCK_FOLDED'),
          z.literal('BLOCK_LITERAL'),
          z.literal('QUOTE_DOUBLE'),
          z.literal('QUOTE_SINGLE'),
          z.literal('PLAIN'),
          z.null(),
        ])
        .optional(),
      defaultStringType: z
        .union([
          z.literal('BLOCK_FOLDED'),
          z.literal('BLOCK_LITERAL'),
          z.literal('QUOTE_DOUBLE'),
          z.literal('QUOTE_SINGLE'),
          z.literal('PLAIN'),
        ])
        .describe(
          "(default: 'PLAIN') - the default type of string literal used to stringify values",
        )
        .optional(),
      directives: z
        .union([z.boolean(), z.null()])
        .describe(
          '(default: null) - include directives in the output. If true, at least the document-start marker --- is always included. If false, no directives or marker is ever included. If null, directives and marker may be included if required',
        )
        .optional(),
      doubleQuotedAsJSON: z
        .boolean()
        .describe(
          '(default: false) - if true, restrict double-quoted strings to use JSON-compatible syntax',
        )
        .optional(),
      doubleQuotedMinMultiLineLength: z
        .number()
        .describe(
          '(default: 40) - minimum length for double-quoted strings to use multiple lines to represent the value instead of escaping newlines',
        )
        .optional(),
      falseStr: z
        .string()
        .describe(
          "(default: 'false') - string representation for false boolean values",
        )
        .optional(),
      flowCollectionPadding: z
        .boolean()
        .describe(
          '(default: true) - if true, a single space of padding will be added inside the delimiters of non-empty single-line flow collections',
        )
        .optional(),
      indent: z
        .number()
        .describe(
          '(default: 2) - the number of spaces to use when indenting code. Should be a strictly positive integer',
        )
        .optional(),
      indentSeq: z
        .boolean()
        .describe(
          '(default: true) - if true, block sequences should be indented',
        )
        .optional(),
      lineWidth: z
        .number()
        .describe(
          '(default: 80) -maximum line width (set to 0 to disable folding). This is a soft limit, as only double-quoted semantics allow for inserting a line break in the middle of a word ',
        )
        .optional(),
      minContentWidth: z
        .number()
        .describe(
          '(default: 20) - minimum line width for highly-indented content (set to 0 to disable)',
        )
        .optional(),
      nullStr: z
        .string()
        .describe("(default: 'null') - string representation for null values")
        .optional(),
      simpleKeys: z
        .boolean()
        .describe(
          '(default: false) - if true, require keys to be scalars and always use implicit rather than explicit notation',
        )
        .optional(),
      singleQuote: z
        .union([z.boolean(), z.null()])
        .describe(
          '(default: null) - Use single quote rather than double quote where applicable. Set to false to disable single quotes completely',
        )
        .optional(),
      trueStr: z
        .string()
        .describe(
          "(default: 'true') - string representation for true boolean values",
        )
        .optional(),
    })
    .optional();
