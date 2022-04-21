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

import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express, { Request } from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { CloudControl } from '@aws-sdk/client-cloudcontrol';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import {Account} from "../types";

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export function createRouter({
  logger,
  config,
}: RouterOptions): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  const accounts: Account[] = (config.getOptionalConfigArray('integrations.aws') || []).map((cfg) => {
      return {
          accountId: cfg.getString('accountId'),
          externalId: cfg.getOptionalString('externalId'),
          roleArn: cfg.getString('roleArn'),
          region: cfg.getOptionalString('region')
      }
  });

  // TODO implement list and possibly create, update and delete if we are brave
  router.get(
    '/:accountId/:typeName/:identifier',
    async (request: Request, response) => {
      const AccountId = request.params.accountId;
      const TypeName = request.params.typeName;
      const Identifier = request.params.identifier;

      logger.debug(
        `received request for ${AccountId}, ${Identifier}, ${TypeName}`,
      );
      const account = accounts.find(acc => {
        return acc.accountId === AccountId;
      });

      if (!account) {
        throw new Error(
          `There is no configuration for the account ${AccountId}`,
        );
      }

      const region =
        typeof request.query.region === 'string'
          ? request.query.region
          : account.region;
      let credentials = undefined;
      const RoleArn = account.roleArn;
      if (RoleArn) {
        credentials = fromTemporaryCredentials({
          clientConfig: { region },
          params: { RoleArn, RoleSessionName: 'backstage-plugin-aws-backend', ExternalId: account.externalId },
        });
      }
      const client = new CloudControl({ credentials, region });

      try {
        const result = await client.getResource({ Identifier, TypeName });
        if (result.ResourceDescription?.Properties) {
          const body = JSON.parse(result.ResourceDescription?.Properties);
          response.status(500);
          response.contentType('application/json');

          logger.info(body.error);
          if (body.error) {
            if (body.error.name === 'ResourceNotFoundException') {
              response.status(404);
              response.contentType('application/json');
            }
          } else {
            response.status(200);
            response.contentType('application/json');
          }
          response.send(body);
        } else {
          response.status(500);
          response.contentType('application/json');
          response.send(
            JSON.stringify({ error: 'an unexpected error occurred' }),
          );
        }
        return;
      } catch (e: any) {
        response.status(500);
        if (e.name === 'ResourceNotFoundException') {
          response.status(404);
        }
        response.contentType('application/json');
        response.send(JSON.stringify({ error: e.message }));
        return;
      }
    },
  );

  router.use(errorHandler());
  return Promise.resolve(router);
}
