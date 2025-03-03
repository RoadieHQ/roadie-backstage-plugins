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
import { makeFieldSchemaFromZod } from '@backstage/plugin-scaffolder';
import { z } from 'zod';

/**
 * @public
 */
export const selectFieldFromApiSchema = z.object({
  params: z
    .union([
      z.record(z.string(), z.string()),
      z.array(z.record(z.string(), z.string())),
    ])
    .optional(),
  path: z
    .string()
    .describe(
      'The Path on the Backstage API and the parameters to fetch the data for the dropdown',
    ),
  arraySelector: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe(
      'This selects the array element from the API fetch response. It finds the array with the name kind',
    ),
  valueSelector: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe(
      'This selects the field in the array to use for the value of each select item. If its not specified it will use the value of the item directly.',
    ),
  labelSelector: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe(
      'This selects the field in the array to use for the label of each select item',
    ),
  title: z.string().optional(),
  placeholder: z
    .string()
    .optional()
    .describe(
      'Renders the provided text as a placeholder value into the select box',
    ),
  description: z.string().optional(),
});

/**
 * @public
 */
export const SelectFieldFromApiSchema = makeFieldSchemaFromZod(
  z.any(),
  selectFieldFromApiSchema,
).schema;
