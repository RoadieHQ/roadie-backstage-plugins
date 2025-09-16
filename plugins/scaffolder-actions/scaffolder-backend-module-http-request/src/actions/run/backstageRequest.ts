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

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  generateBackstageUrl,
  http,
  getObjFieldCaseInsensitively,
  getPluginId,
} from './helpers';
import { HttpOptions, Headers, Body } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { AuthService } from '@backstage/backend-plugin-api';

export function createHttpBackstageAction(options: {
  discovery: DiscoveryApi;
  auth?: AuthService;
}) {
  const { discovery, auth } = options;
  return createTemplateAction({
    id: 'http:backstage:request',
    description:
      'Sends a HTTP request to the Backstage API. It uses the token of the user who triggers the task to authenticate requests.',
    supportsDryRun: true,
    schema: {
      input: {
        path: z => z.string().describe('The url path you want to query'),
        method: z =>
          z
            .enum([
              'GET',
              'HEAD',
              'OPTIONS',
              'POST',
              'UPDATE',
              'DELETE',
              'PUT',
              'PATCH',
            ])
            .describe('The method type of the request'),
        headers: z =>
          z
            .record(z.any())
            .optional()
            .describe('The headers you would like to pass to your request'),
        params: z =>
          z
            .record(z.any())
            .optional()
            .describe(
              'The query parameters you would like to pass to your request',
            ),
        body: z =>
          z
            .any()
            .optional()
            .describe('The body you would like to pass to your request'),
        logRequestPath: z =>
          z
            .boolean()
            .optional()
            .describe('Option to turn request path logging off. On by default'),
        continueOnBadResponse: z =>
          z
            .boolean()
            .optional()
            .describe(
              'Return response code and body and continue to next scaffolder step if the response status is 4xx or 5xx. By default the step will fail if any status code is returned 400 and above.',
            ),
        timeout: z =>
          z
            .number()
            .optional()
            .describe('Timeout for the request (milliseconds)')
            .default(60000),
      },
      output: {
        code: z =>
          z.string().describe('The response code of the request').optional(),
        headers: z =>
          z.record(z.any()).describe('The headers of the response').optional(),
        body: z => z.any().describe('The body of the response').optional(),
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

      const inputHeaders: [string, any][] | undefined =
        input.headers && Object.entries(input.headers);
      if (
        input.body &&
        typeof input.body !== 'string' &&
        inputHeaders &&
        inputHeaders.find(
          kv =>
            kv[0].toLowerCase() === 'content-type' &&
            kv[1].toLowerCase() === 'application/json',
        )
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
