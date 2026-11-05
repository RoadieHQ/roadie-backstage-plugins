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

import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description:
      'Templates a single skeleton directory, sharing values through `commonParams`.',
    example: yaml.stringify({
      steps: [
        {
          action: 'fetch:template:plus',
          id: 'fetch-template',
          name: 'Fetch template',
          input: {
            commonParams: {
              values: {
                name: 'test-project',
                count: 1234,
                itemList: ['first', 'second', 'third'],
                showDummyFile: false,
              },
            },
            templates: [
              {
                url: './skeleton',
                targetPath: './',
              },
            ],
          },
        },
      ],
    }),
  },
  {
    description:
      'Templates several skeleton directories into different target paths in a single step. Values from `commonParams` are merged into every entry, and per-entry fields win on conflict.',
    example: yaml.stringify({
      steps: [
        {
          action: 'fetch:template:plus',
          id: 'fetch-template',
          name: 'Fetch templates',
          input: {
            commonParams: {
              values: {
                name: 'test-project',
                owner: 'team-a',
              },
            },
            templates: [
              {
                url: './skeleton/main',
                targetPath: './target-main',
              },
              {
                url: './skeleton/docs',
                targetPath: './target-docs',
                values: {
                  owner: 'team-docs',
                },
              },
            ],
          },
        },
      ],
    }),
  },
  {
    description:
      'Skips an entry based on a template parameter with `skipIf`, and tolerates a failing entry with `ignoreErrors`.',
    example: yaml.stringify({
      steps: [
        {
          action: 'fetch:template:plus',
          id: 'fetch-template',
          name: 'Fetch optional templates',
          input: {
            commonParams: {
              values: {
                name: 'test-project',
              },
            },
            templates: [
              {
                url: './skeleton/main',
                targetPath: './',
              },
              {
                url: './skeleton/ci',
                targetPath: './.github',
                skipIf: '${{ not parameters.enableCi }}',
              },
              {
                url: 'https://github.com/org/shared-skeletons/tree/main/optional',
                targetPath: './optional',
                ignoreErrors: true,
              },
            ],
          },
        },
      ],
    }),
  },
];
