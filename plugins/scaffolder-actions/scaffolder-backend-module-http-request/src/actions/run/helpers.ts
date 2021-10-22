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

export const generateBackstageUrl = (config: Config, path: string): string => {
  // ensure the request points to the correct domain
  const externalUrl = config.getOptionalString('backend.baseUrl') || '';
  if (externalUrl === '') {
    throw new Error('Unable to get base url');
  }
  return externalUrl + path;
};

export const http = async (
  options: HttpOptions,
  logger: Logger,
): Promise<any> => {
  let res: any;
  const { url, ...other } = options;
  try {
    res = await fetch(url, other);
  } catch (e) {
    throw new HttpError(`There was an issue with the request: ${e}`);
  }

  if (res.status >= 400) {
    logger.error(
      `There was an issue with your request. Status code: ${res.status}`,
    );
    throw new HttpError('Unable to complete request');
  }

  const headers: any = {};
  for (const [name, value] of res.headers) {
    headers[name] = value;
  }

  try {
    const body =
      headers['content-type'] &&
      headers['content-type'].includes('application/json')
        ? await res.json()
        : { message: await res.text() };

    return { code: res.status, headers, body };
  } catch (e) {
    throw new HttpError(`Could not get response: ${e}`);
  }
};
