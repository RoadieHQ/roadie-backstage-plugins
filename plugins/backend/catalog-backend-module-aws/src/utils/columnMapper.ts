/*
 * Copyright 2022 Larder Software Limited
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
import { set, template, trim } from 'lodash';

import { ValueMapping } from '../types';

/**
 * Constructs an object from a `splitChar` separated string.
 * Supports keys with `splitChar` in them if they are encapsulated within `encapsulatorChar`
 *
 * Examples:
 *
 * text: 'metadata.annotations."backstage.io/view-url"'
 * splitChar: '.'
 * encapsulatorChar: '"'
 * -->
 * ['metadata', 'annotations', 'backstage.io/view-url']
 */
export function splitExceptWithin(
  text: string,
  splitChar: string,
  encapsulatorChar: string,
  escapeChar: string = '\\',
) {
  let start = 0;
  let encapsulated = false;
  const fields = [];
  for (let c = 0; c < text.length; c++) {
    const char = text[c];
    if (char === splitChar && !encapsulated) {
      fields.push(trim(text.substring(start, c), encapsulatorChar));
      start = c + 1;
    }
    if (char === encapsulatorChar && (c === 0 || text[c - 1] !== escapeChar))
      encapsulated = !encapsulated;
  }
  fields.push(trim(text.substring(start), encapsulatorChar));
  return fields;
}

export function mapColumnsToEntityValues(
  valueMappings: { [key: string]: ValueMapping },
  row: { [key: string]: any },
) {
  const o = {};
  for (const [columnName, mapping] of Object.entries(valueMappings)) {
    if (row[columnName]) {
      const templateSettings = { interpolate: /{{([\s\S]+?)}}/g };
      const value = mapping.template
        ? template(
            mapping.template,
            templateSettings,
          )({
            value: row[columnName],
          })
        : row[columnName];
      set(o, splitExceptWithin(mapping.entityPath, '.', '"'), value);
    }
  }
  return o;
}
