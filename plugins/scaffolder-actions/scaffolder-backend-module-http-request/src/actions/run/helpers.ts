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
import { Config } from '@backstage/config';
import { fetch } from 'cross-fetch';
import { Logger } from 'winston';
import { HttpOptions } from './types';

class HttpError extends Error {}
const DEFAULT_TIMEOUT = 60_000;

export const generateBackstageUrl = (
  config: Config,
  path: string,
  baseUrl?: string,
): string => {
  // Use the user-provided baseUrl, otherwise use the backend.baseUrl from the app config.
  let externalUrl = '';
  const configBaseUrl = config.getOptionalString('backend.baseUrl');
  if (baseUrl) {
    externalUrl = baseUrl;
  } else if (configBaseUrl) {
    externalUrl = configBaseUrl;
  } else {
    throw new Error(
      'Unable to generate Backstage Url, baseUrl not provided in scaffolder action or the app config.',
    );
  }
  return externalUrl + path;
};

export const http = async (
  options: HttpOptions,
  logger: Logger,
): Promise<any> => {
  let res: any;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  const { url, ...other } = options;
  const httpOptions = { ...other, signal: controller.signal };

  try {
    res = await fetch(url, httpOptions);
    if (!res) {
      throw new HttpError(
        `Request was aborted as it took longer than ${
          DEFAULT_TIMEOUT / 1000
        } seconds`,
      );
    }
  } catch (e) {
    throw new HttpError(`There was an issue with the request: ${e}`);
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
    throw new HttpError(`Could not get response: ${e}`);
  }

  if (res.status >= 400) {
    logger.error(
      `There was an issue with your request. Status code: ${
        res.status
      } Response body: ${JSON.stringify(body)}`,
    );
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
