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

import { Config } from '@backstage/config';
import { AccountConfig } from '../types';
import { readTaskScheduleDefinitionFromConfig } from '@backstage/backend-tasks';

export const DEFAULT_PROVIDER_ID = 'default';

export const getAccountConfig = (config: Config, id: string): AccountConfig => {
  const orgUrl = config.getString('orgUrl');
  const token = config.getOptionalString('token');

  const userFilter = config.getOptionalString('userFilter');
  const groupFilter = config.getOptionalString('groupFilter');
  const clientId = config.getOptionalString('oauth.clientId');
  const keyId = config.getOptionalString('oauth.keyId');
  const privateKey = config.getOptionalString('oauth.privateKey');

  const oauth =
    clientId && privateKey ? { clientId, keyId, privateKey } : undefined;

  const schedule = config.has('schedule')
    ? readTaskScheduleDefinitionFromConfig(config.getConfig('schedule'))
    : undefined;

  return {
    id,
    orgUrl,
    token,
    userFilter,
    groupFilter,
    oauth,
    schedule,
  };
};

export const getAccountConfigs = (config: Config): AccountConfig[] => {
  const providersConfig = config.getOptionalConfig('catalog.providers.okta');
  if (!providersConfig) {
    return [];
  }
  if (providersConfig.has('orgUrl')) {
    // simple/single config variant
    return [getAccountConfig(providersConfig, DEFAULT_PROVIDER_ID)];
  }
  return providersConfig.keys().map(id => {
    const providerConfig = providersConfig.getConfig(id);
    return getAccountConfig(providerConfig, id);
  });
};
