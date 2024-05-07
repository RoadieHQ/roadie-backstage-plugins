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

export const labelsFromTags = (tags?: Tag[] | Record<string, string>) => {
  if (!tags) {
    return {};
  }
  if (Array.isArray(tags)) {
    return tags?.reduce((acc: Record<string, string>, tag) => {
      if (tag.Key && tag.Value) {
        const key = tag.Key.replaceAll(':', '_').replaceAll('/', '-');
        acc[key] = tag.Value.replaceAll('/', '-').substring(0, 63);
      }
      return acc;
    }, {});
  }
  return Object.entries(tags as Record<string, string>).reduce(
    (acc: Record<string, string>, [key, value]) => {
      if (key && value) {
        const k = key.replaceAll(':', '_').replaceAll('/', '-');
        acc[k] = value.replaceAll('/', '-').substring(0, 63);
      }
      return acc;
    },
    {},
  );
};

export const ownerFromTags = (
  tags?: Tag[] | Record<string, string>,
  ownerTagKey = 'owner',
  groups?: Entity[],
) => {
  if (!tags) {
    return UNKNOWN_OWNER;
  }

  let ownerString: string | undefined;
  if (Array.isArray(tags)) {
    const ownerTag = tags?.find(tag => tag.Key === ownerTagKey);
    if (ownerTag) {
      ownerString = ownerTag.Value ? ownerTag.Value : undefined;
    }
  }
  ownerString = (tags as Record<string, string>)[ownerTagKey];

  if (ownerString && groups && groups.length > 0) {
    const exactMatch = groups.find(
      g => g.metadata.name.toLowerCase() === ownerString?.toLowerCase(),
    );
    if (exactMatch) {
      return stringifyEntityRef(exactMatch);
    }
  }

  if (!groups) {
    return ownerString;
  }

  return UNKNOWN_OWNER;
};
