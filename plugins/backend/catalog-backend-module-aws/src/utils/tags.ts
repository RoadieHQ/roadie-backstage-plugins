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

import { Entity, stringifyEntityRef } from '@backstage/catalog-model';

type Tag = {
  Key?: string;
  Value?: string;
};
const UNKNOWN_OWNER = 'unknown';

const TAG_DEPENDS_ON = 'dependsOn';
const TAG_DEPENDENCY_OF = 'dependencyOf';
const TAG_SYSTEM = 'system';
const TAG_DOMAIN = 'domain';

const dependencyTags = [TAG_DEPENDENCY_OF, TAG_DEPENDS_ON];
const relationshipTags = [TAG_SYSTEM, TAG_DOMAIN];

export const labelsFromTags = (tags?: Tag[] | Record<string, string>) => {
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
          const key = tag.Key.replaceAll(':', '_').replaceAll('/', '-');
          acc[key] = tag.Value.replaceAll('/', '-')
            .replaceAll(':', '-')
            .substring(0, 63);
        }
        return acc;
      }, {});
  }
  return Object.entries(tags as Record<string, string>)
    ?.filter(
      ([tagKey]) =>
        ![...dependencyTags, ...relationshipTags]
          .map(it => it.toLowerCase())
          .includes(tagKey.toLowerCase()),
    )
    .reduce((acc: Record<string, string>, [key, value]) => {
      if (key && value) {
        const k = key.replaceAll(':', '_').replaceAll('/', '-');
        acc[k] = value.replaceAll('/', '-').substring(0, 63);
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
    ownerString = (tags as Record<string, string>)[ownerTagKey];
  }

  if (ownerString && groups && groups.length > 0) {
    const exactMatch = groups.find(
      g => g.metadata.name.toLowerCase() === ownerString?.toLowerCase(),
    );
    if (exactMatch) {
      return stringifyEntityRef(exactMatch);
    }
  }

  return ownerString ? ownerString : UNKNOWN_OWNER;
};

export const relationshipsFromTags = (
  tags?: Tag[] | Record<string, string>,
): Record<string, string | string[]> => {
  if (!tags) {
    return {};
  }

  const specPartial: Record<string, string | string[]> = {};
  if (Array.isArray(tags)) {
    dependencyTags.forEach(tagKey => {
      const tagValue = tags?.find(
        tag => tag.Key?.toLowerCase() === tagKey?.toLowerCase(),
      );
      if (tagValue && tagValue.Value) {
        specPartial[tagKey] = [tagValue.Value.split(',')].flat();
      }
    });

    relationshipTags.forEach(tagKey => {
      const tagValue = tags?.find(
        tag => tag.Key?.toLowerCase() === tagKey?.toLowerCase(),
      );
      if (tagValue && tagValue.Value) {
        specPartial[tagKey] = tagValue.Value;
      }
    });
  }

  return specPartial;
};
