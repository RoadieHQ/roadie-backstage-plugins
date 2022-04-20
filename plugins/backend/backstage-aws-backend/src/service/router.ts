import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { CloudControl } from "@aws-sdk/client-cloudcontrol";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers"

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

  // TODO implement list and possibly create and delete if we are brave
  router.get('/:accountId/:typeName/:identifier', async (request, response) => {
    const AccountId = request.params.accountId;
    const TypeName = request.params.typeName;
    const Identifier = request.params.identifier;
    logger.debug(`${config}, ${AccountId} ${Identifier}, ${TypeName}`);
    const RoleArn = config.getOptionalString(`aws.accounts.aws${AccountId}.roleArn`);
    let credentials = undefined;
    if (RoleArn) {
      credentials = fromTemporaryCredentials({params: {RoleArn, RoleSessionName: 'backstage-plugin-aws-backend'}})
    }
    const client = new CloudControl({ credentials });

    try {
      const result = await client.getResource({ Identifier, TypeName } );
      if (result.ResourceDescription?.Properties) {
        const body = JSON.parse(result.ResourceDescription?.Properties)
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
          response.contentType('application/json')
        }
        response.send(body);
        return;
      } else {
        response.status(500);
        response.contentType('application/json')
        response.send(JSON.stringify({error: "an unexpected error occurred"}));
        return;
      }
    } catch(e: any) {
      response.status(500);
      if (e.name === 'ResourceNotFoundException') {
        response.status(404);
      }
      response.contentType('application/json')
      response.send(JSON.stringify({error: e.message}));
      return;
    }
  });

  router.use(errorHandler());
  return Promise.resolve(router);
}
