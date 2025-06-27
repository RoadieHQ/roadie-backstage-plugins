/*
 * Copyright 2021 Larder Software Limited
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
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { fetch } from 'cross-fetch';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
import { HttpOptions } from './types';

class HttpError extends Error {}

export const getPluginId = (path: string): string => {
  const pluginId = (path.startsWith('/') ? path.substring(1) : path).split(
    '/',
  )[0];
  return pluginId;
};

export const generateBackstageUrl = async (
  discovery: DiscoveryApi,
  path: string,
): Promise<string> => {
  const [pluginId, ...rest] = (
    path.startsWith('/') ? path.substring(1) : path
  ).split('/');
  return `${await discovery.getBaseUrl(pluginId)}/${rest.join('/')}`;
};

export const http = async (
  options: HttpOptions,
  logger: Logger | LoggerService,
  continueOnBadResponse: boolean = false,
): Promise<any> => {
  let res: any;
  const TIMEOUT = options.timeout || 60_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  const { url, ...other } = options;
  const httpOptions = { ...other, signal: controller.signal };

  try {
    res = await fetch(url, httpOptions);
  } catch (e) {
    throw new HttpError(`There was an issue with the request: ${e}`);
  }
  if (!res) {
    throw new HttpError(
      `Request was aborted as it took longer than ${TIMEOUT / 1000} seconds`,
    );
  }

  clearTimeout(timeoutId);

  const headers: any = {};
  for (const [name, value] of res.headers) {
    headers[name] = value;
  }

  const isJSON = () =>
    headers['content-type'] &&
    headers['content-type'].includes('application/json');

  let body;
  try {
    body = isJSON() ? await res.json() : { message: await res.text() };
  } catch (e) {
    throw new HttpError(`Could not parse response body: ${e}`);
  }

  if (res.status >= 400) {
    logger.error(
      `There was an issue with your request. Status code: ${
        res.status
      } Response body: ${JSON.stringify(body)}`,
    );
    if (continueOnBadResponse) {
      return { code: res.status, headers: {}, body };
    }
    throw new HttpError('Unable to complete request');
  }
  return { code: res.status, headers, body };
};

export const getObjFieldCaseInsensitively = (obj = {}, fieldName: string) => {
  const [, value = ''] =
    Object.entries<string>(obj).find(
      ([key]) => key.toLowerCase() === fieldName.toLowerCase(),
    ) || [];

  return value;
};
