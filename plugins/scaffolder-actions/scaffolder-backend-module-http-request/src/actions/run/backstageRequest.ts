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

import {
  createTemplateAction,
  TemplateAction,
} from '@backstage/plugin-scaffolder-node';
import {
  generateBackstageUrl,
  http,
  getObjFieldCaseInsensitively,
  getPluginId,
} from './helpers';
import { HttpOptions, Headers, Params, Methods, Body } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { AuthService } from '@backstage/backend-plugin-api';
import { JsonObject } from '@backstage/config/index';

export function createHttpBackstageAction(options: {
  discovery: DiscoveryApi;
  auth?: AuthService;
}): TemplateAction<
  {
    path: string;
    method: Methods;
    headers?: Headers;
    params?: Params;
    body?: any;
    logRequestPath?: boolean;
    continueOnBadResponse?: boolean;
  },
  JsonObject
> {
  const { discovery, auth } = options;
  return createTemplateAction<{
    path: string;
    method: Methods;
    headers?: Headers;
    params?: Params;
    body?: any;
    logRequestPath?: boolean;
    continueOnBadResponse?: boolean;
    timeout?: number;
  }>({
    id: 'http:backstage:request',
    description:
      'Sends a HTTP request to the Backstage API. It uses the token of the user who triggers the task to authenticate requests.',
    supportsDryRun: true,
    schema: {
      input: {
        type: 'object',
        required: ['path', 'method'],
        properties: {
          method: {
            title: 'Method',
            type: 'string',
            description: 'The method type of the request',
            enum: [
              'GET',
              'HEAD',
              'OPTIONS',
              'POST',
              'UPDATE',
              'DELETE',
              'PUT',
              'PATCH',
            ],
          },
          path: {
            title: 'Request path',
            description: 'The url path you want to query',
            type: 'string',
          },
          headers: {
            title: 'Request headers',
            description: 'The headers you would like to pass to your request',
            type: 'object',
          },
          params: {
            title: 'Request query params',
            description:
              'The query parameters you would like to pass to your request',
            type: 'object',
          },
          body: {
            title: 'Request body',
            description: 'The body you would like to pass to your request',
            type: ['object', 'string', 'array'],
          },
          logRequestPath: {
            title: 'Request path logging',
            description:
              'Option to turn request path logging off. On by default',
            type: 'boolean',
          },
          continueOnBadResponse: {
            title: 'Continue on error',
            description:
              'Return response code and body and continue to next scaffolder step if the response status is 4xx or 5xx. By default the step will fail if any status code is returned 400 and above.',
            type: 'boolean',
            default: 'false',
          },
          timeout: {
            title: 'Timeout for the request (milliseconds)',
            description:
              'If the request takes more than the specified timeout it throws an error',
            type: 'number',
            default: '60000',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          code: {
            title: 'Response Code',
            type: 'string',
          },
          headers: {
            title: 'Response Headers',
            type: 'object',
          },
          body: {
            title: 'Response Body',
            type: 'object',
          },
        },
      },
    },

    async handler(ctx) {
      const { input } = ctx;
      const pluginId = getPluginId(input.path);
      const { token } = (await auth?.getPluginRequestToken({
        onBehalfOf: await ctx.getInitiatorCredentials(),
        targetPluginId: pluginId,
      })) ?? { token: ctx.secrets?.backstageToken };
      const { method, params } = input;
      const logRequestPath = input.logRequestPath ?? true;
      const continueOnBadResponse = input.continueOnBadResponse || false;
      const url = await generateBackstageUrl(discovery, input.path);
      if (logRequestPath) {
        ctx.logger.info(
          `Creating ${method} request with ${this.id} scaffolder action against ${input.path}`,
        );
      } else {
        ctx.logger.info(
          `Creating ${method} request with ${this.id} scaffolder action`,
        );
      }

      const queryParams: string = params
        ? new URLSearchParams(params).toString()
        : '';

      let inputBody: Body = undefined;

      if (
        input.body &&
        typeof input.body !== 'string' &&
        input.headers &&
        input.headers['content-type'] &&
        input.headers['content-type'].includes('application/json')
      ) {
        inputBody = JSON.stringify(input.body);
      } else {
        inputBody = input.body;
      }

      const httpOptions: HttpOptions = {
        method: input.method,
        timeout: input.timeout,
        url: queryParams !== '' ? `${url}?${queryParams}` : url,
        headers: input.headers ? (input.headers as Headers) : {},
        body: inputBody,
      };

      const authToken = getObjFieldCaseInsensitively(
        input.headers,
        'authorization',
      );

      if (token && !authToken) {
        ctx.logger.info(`Token is defined. Setting authorization header.`);
        httpOptions.headers.authorization = `Bearer ${token}`;
      }

      const dryRunSafeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
      if (ctx.isDryRun === true && !dryRunSafeMethods.has(method)) {
        ctx.logger.info(
          `Dry run mode. Skipping non dry-run safe method '${method}' request to ${
            queryParams !== '' ? `${input.path}?${queryParams}` : input.path
          }`,
        );
        return;
      }

      const { code, headers, body } = await http(
        httpOptions,
        ctx.logger,
        continueOnBadResponse,
      );

      ctx.output('code', code);
      ctx.output('headers', headers);
      ctx.output('body', body);
    },
  });
}
