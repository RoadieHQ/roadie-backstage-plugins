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
        .optional(),
      directives: z.union([z.boolean(), z.null()]).optional(),
      doubleQuotedAsJSON: z.boolean().optional(),
      doubleQuotedMinMultiLineLength: z.number().optional(),
      falseStr: z.string().optional(),
      flowCollectionPadding: z.boolean().optional(),
      indent: z.number().optional(),
      indentSeq: z.boolean().optional(),
      lineWidth: z.number().optional(),
      minContentWidth: z.number().optional(),
      nullStr: z.string().optional(),
      simpleKeys: z.boolean().optional(),
      singleQuote: z.union([z.boolean(), z.null()]).optional(),
      trueStr: z.string().optional(),
    })
    .optional();
