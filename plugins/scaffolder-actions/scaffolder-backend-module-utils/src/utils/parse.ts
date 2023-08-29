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

import yaml from 'js-yaml';

export const parsers: Record<
  'yaml' | 'json' | 'multiyaml',
  (cnt: string) => unknown
> = {
  yaml: cnt => yaml.load(cnt),
  json: cnt => JSON.parse(cnt),
  multiyaml: cnt => yaml.loadAll(cnt),
};

export function parseContent(
  content: string,
  fileExtension: string,
  parser?: 'yaml' | 'json' | 'multiyaml',
): unknown {
  // If parser is specified, use it
  if (parser) {
    return parsers[parser](content);
  }

  // Otherwise, try to guess based on file extension
  switch (fileExtension) {
    case '.json':
      return parsers.json(content);
    case '.yaml':
    case '.yml':
      return parsers.yaml(content);
    default:
      break;
  }

  return content;
}
