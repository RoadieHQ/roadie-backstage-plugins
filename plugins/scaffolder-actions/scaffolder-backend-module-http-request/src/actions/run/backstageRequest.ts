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

import {ActionContext, createTemplateAction} from '@backstage/plugin-scaffolder-backend';
import { generateBackstageUrl } from './helpers';
import { Headers, Params, Methods, Body } from './types';
import { Config } from '@backstage/config';
import { HttpBackstageRequestAuthorizer, HttpClient } from "./HttpClient";

export type HttpBackstageRequestAuthorizerFactory = (ctx: ActionContext<HttpBackstageActionInput>) => HttpBackstageRequestAuthorizer

const defaultHttpBackstageRequestAuthorizerFactory: HttpBackstageRequestAuthorizerFactory = (ctx) => {
  return (request: RequestInit) => {
    const token = ctx.secrets?.backstageToken;
    request.headers = request.headers as {}
    if (token) {
      ctx.logger.info(`Token is defined. Setting authorization header.`);
      request.headers.authorization = `Bearer ${token}`;
    }

    return request;
  }
}
export type HttpBackstageActionInput = {
  path: string;
  method: Methods;
  headers?: Headers;
  params?: Params;
  body?: Body;
}

export function createHttpBackstageAction(options: { config: Config, authorizerFactory?: HttpBackstageRequestAuthorizerFactory }) {
  const { config } = options;
  return createTemplateAction<HttpBackstageActionInput>({
    id: 'http:backstage:request',
    description:
      'Sends a HTTP request to the Backstage API. It uses the token of the user who triggers the task to authenticate requests.',
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
            type: 'object',
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
      const { method, params } = input;
      let url = await generateBackstageUrl(config, input.path);

      ctx.logger.info(
        `Creating ${method} request with http:backstage:proxy scaffolder action against ${url}`,
      );

      const queryParams: string = params
        ? new URLSearchParams(params).toString()
        : '';

      let inputBody: Body = undefined;

      if (
        input.body &&
        input.headers &&
        input.headers['content-type'] &&
        input.headers['content-type'].includes('application/json')
      ) {
        inputBody = JSON.stringify(input.body);
      } else {
        inputBody = input.body;
      }

      url = queryParams !== '' ? `${url}?${queryParams}` : url;
      const httpOptions: RequestInit = {
        method: input.method,
        body: inputBody,
      };

      httpOptions.headers = input.headers || {}

      const authorizer = (options.authorizerFactory || defaultHttpBackstageRequestAuthorizerFactory)(ctx)

      const httpClient = new HttpClient({ logger: ctx.logger, authorizer });

      const { code, headers, body } = await httpClient.request(url, httpOptions);

      ctx.output('code', code);
      ctx.output('headers', headers);
      ctx.output('body', body);
    },
  });
}
