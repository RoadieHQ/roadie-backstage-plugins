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
import get from 'lodash/get';
import { isError } from '@backstage/errors';
import { Group, Client } from '@okta/okta-sdk-nodejs';
import { Logger } from 'winston';
import { GroupNamingStrategy } from './groupNamingStrategies';

type GetOktaGroupsOptions = {
  client: Client;
  groupFilter: string | undefined;
  key: string | undefined;
  groupNamingStrategy: GroupNamingStrategy;
  logger: Logger;
};

export const getOktaGroups = async (opts: GetOktaGroupsOptions) => {
  const { client, groupFilter, key, groupNamingStrategy, logger } = opts;

  const oktaGroups: Record<string, Group> = {};

  await client.listGroups({ search: groupFilter }).each(group => {
    if (key) {
      const id = get(group, key);
      if (typeof id === 'string') {
        oktaGroups[id] = group;
      }
      if (typeof id === 'number') {
        oktaGroups[id.toString()] = group;
      }
    } else {
      try {
        oktaGroups[groupNamingStrategy(group)] = group;
      } catch (e: unknown) {
        logger.warn(
          `Failed to add group ${group.id}: ${
            isError(e) ? e.message : 'unknown error'
          }`,
        );
      }
    }
  });
  return oktaGroups;
};
