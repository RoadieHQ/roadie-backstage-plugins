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

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import {
  ECRClient,
  CreateRepositoryCommand,
  CreateRepositoryCommandInput,
  ImageTagMutability,
  ECRClientConfig,
} from '@aws-sdk/client-ecr';
import { CredentialProvider } from '@aws-sdk/types';
import { assertError } from '@backstage/errors';

export function createEcrAction(options?: {
  credentials?: CredentialProvider;
}) {
  return createTemplateAction<{
    repoName: string;
    tags: Array<any>;
    imageMutability: boolean;
    scanOnPush: boolean;
    region: string;
  }>({
    id: 'roadiehq:aws:ecr:create',
    schema: {
      input: {
        required: ['repoName', 'region'],
        type: 'object',
        properties: {
          repoName: {
            type: 'string',
            title: 'repoName',
            description: 'The name of the ECR repository',
          },
          tags: {
            type: 'array',
            title: 'tags',
            description: 'list of tags',
          },
          imageMutability: {
            type: 'boolean',
            title: 'ImageMutability',
            description: 'set image mutability to true or false',
          },
          scanOnPush: {
            type: 'boolean',
            title: 'Scan On Push',
            description:
              'The image scanning configuration for the repository. This determines whether images are scanned for known vulnerabilities after being pushed to the repository.',
          },
          region: {
            type: 'string',
            title: 'aws region',
            description: 'aws region to create ECR on',
          },
        },
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
      }
    },
  });
}
