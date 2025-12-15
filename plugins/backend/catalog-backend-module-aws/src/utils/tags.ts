/*
 * Copyright 2024 Larder Software Limited
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

import { type Entity, stringifyEntityRef } from '@backstage/catalog-model';

import { stripBoundingSpecials } from './stripBoundingSpecials';

export type Tag = {
  Key?: string;
  Value?: string;
};

export type LabelValueMapper = (value: string) => string;
const UNKNOWN_OWNER = 'unknown';

const TAG_DEPENDS_ON = 'dependsOn';
const TAG_DEPENDENCY_OF = 'dependencyOf';
const TAG_SYSTEM = 'system';
const TAG_DOMAIN = 'domain';

const dependencyTags = [TAG_DEPENDENCY_OF, TAG_DEPENDS_ON];
const relationshipTags = [TAG_SYSTEM, TAG_DOMAIN];

/**
 * From the Backstage Documentation:
 *
 * The name part must be sequences of [a-zA-Z0-9] separated by any of [-_.], at most 63 characters in total.
 * ...
 * Values are strings that follow the same restrictions as name above.
 */
const defaultNameCleaner: LabelValueMapper = value => {
  const val = value.replaceAll(/[^a-zA-Z0-9-_.]/g, '-');
  return stripBoundingSpecials(val).substring(0, 63);
};

export const labelsFromTags = (
  tags?: Tag[] | Record<string, string>,
  valueMapper: LabelValueMapper = defaultNameCleaner,
) => {
  if (!tags) {
    return {};
  }
  if (Array.isArray(tags)) {
    return tags
      ?.filter(
        tag =>
          !tag.Key ||
          ![...dependencyTags, ...relationshipTags]
            .map(it => it.toLowerCase())
            .includes(tag.Key.toLowerCase()),
      )
      .reduce((acc: Record<string, string>, tag) => {
        if (tag.Key && tag.Value) {
          let key = tag.Key.replaceAll('/', '-')
            .replaceAll(/[^a-zA-Z0-9-_.]/g, '_')
            .substring(0, 63);
          key = stripBoundingSpecials(key);
          acc[key] = valueMapper(tag.Value);
        }
        return acc;
      }, {});
  }
  return Object.entries(tags)
    ?.filter(
      ([tagKey]) =>
        ![...dependencyTags, ...relationshipTags]
          .map(it => it.toLowerCase())
          .includes(tagKey.toLowerCase()),
    )
    .reduce((acc: Record<string, string>, [key, value]) => {
      if (key && value) {
        let k = key.replaceAll(':', '_').replaceAll('/', '-');
        k = stripBoundingSpecials(k);
        acc[k] = valueMapper(value);
      }
      return acc;
    }, {});
};

export const ownerFromTags = (
  tags?: Tag[] | Record<string, string>,
  ownerTagKey = 'owner',
  groups?: Entity[],
): string => {
  if (!tags) {
    return UNKNOWN_OWNER;
  }

  let ownerString: string | undefined;
  if (Array.isArray(tags)) {
    const ownerTag = tags?.find(
      tag => tag.Key?.toLowerCase() === ownerTagKey?.toLowerCase(),
    );
    if (ownerTag) {
      ownerString = ownerTag.Value ? ownerTag.Value : undefined;
    }
  } else {
    ownerString = tags[ownerTagKey];
  }

  if (ownerString && groups && groups.length > 0) {
    const exactMatch = groups.find(
      g =>
        g.metadata.name.toLowerCase() === ownerString?.toLowerCase() ||
        `${g.metadata.namespace}/${g.metadata.name}`.toLowerCase() ===
          ownerString?.toLowerCase(),
    );
    if (exactMatch) {
      return stringifyEntityRef(exactMatch);
    }
  }

  return ownerString ?? UNKNOWN_OWNER;
};

export const relationshipsFromTags = (
  tags?: Tag[] | Record<string, string>,
): Record<string, string | string[]> => {
  if (!tags) {
    return {};
  }

  let tagMap: Record<string, string | string[]> = {};
  if (Array.isArray(tags)) {
    for (const tag of tags) {
      if (tag.Key && tag.Value) {
        tagMap[tag.Key] = tag.Value;
      }
    }
  } else {
    tagMap = tags;
  }

  const tagNames = Object.keys(tagMap);

  const specPartial: Record<string, string[]> = {};
  for (const tagKey of dependencyTags) {
    const tagName = tagNames.find(
      tn => tn.toLowerCase() === tagKey.toLowerCase(),
    );
    const tagValue = tagMap[tagName!];
    if (typeof tagValue === 'string') {
      specPartial[tagKey] = [tagValue.split(',')].flat();
    }
  }

  for (const tagKey of relationshipTags) {
    const tagValue = tagMap[tagKey];
    if (typeof tagValue === 'string') {
      specPartial[tagKey] = [tagValue];
    }
  }

  return specPartial;
};
