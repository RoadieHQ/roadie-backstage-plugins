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
  ECRClient,
  CreateRepositoryCommand,
  CreateRepositoryCommandInput,
  ImageTagMutability,
  ECRClientConfig,
} from '@aws-sdk/client-ecr';
import { CredentialProvider } from '@aws-sdk/types';
import { assertError } from '@backstage/errors';
import { TemplateAction } from '@backstage/plugin-scaffolder-node';

export function createEcrAction(options?: {
  credentials?: CredentialProvider;
}): TemplateAction<
  {
    repoName: string;
    tags: Array<any>;
    imageMutability: boolean;
    scanOnPush: boolean;
    region: string;
  },
  any
> {
  return createTemplateAction({
    id: 'roadiehq:aws:ecr:create',
    schema: {
      input: {
        repoName: z => z.string().describe('The name of the ECR repository'),
        region: z => z.string().describe('AWS region to create ECR in'),
        tags: z =>
          z
            .array(
              z.object({
                Key: z.string(),
                Value: z.string(),
              }),
            )
            .optional()
            .describe('list of tags'),
        imageMutability: z =>
          z
            .boolean()
            .describe('set image mutability to true or false')
            .optional(),
        scanOnPush: z =>
          z
            .boolean()
            .describe('Scan images for vulnerabilities on push')
            .optional(),
      },
    },
    async handler(ctx) {
      const setImageMutability = ctx.input.imageMutability
        ? ImageTagMutability.MUTABLE
        : ImageTagMutability.IMMUTABLE;
      const input: CreateRepositoryCommandInput = {
        repositoryName: ctx.input.repoName,
        imageScanningConfiguration: { scanOnPush: ctx.input.scanOnPush },
        imageTagMutability: setImageMutability,
        tags: ctx.input.tags,
      };
      const config: ECRClientConfig = {
        region: ctx.input.region,
        ...(options?.credentials && {
          credentials: await options.credentials(),
        }),
      };
      const createCommand = new CreateRepositoryCommand(input);
      const client = new ECRClient(config);
      try {
        const response = await client.send(createCommand);
        ctx.logger.info(
          `Created ECR repository: ${response.repository?.repositoryUri}`,
        );
      } catch (e) {
        assertError(e);
        ctx.logger.warn(`Unable to create ECR repository: ${e}`);
        throw e;
      }
    },
  });
}
