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
    RepoName: string;
    Tags: Array<any>;
    ImageMutability: boolean;
    Region: string;
    values: any;
  }>({
    id: 'roadiehq:aws:ecr:create',
    schema: {
      input: {
        required: ['RepoName'],
        type: 'object',
        properties: {
          RepoName: {
            type: 'string',
            title: 'RepoName',
            description: 'The name of the ECR repository',
          },
          Tags: {
            type: 'array',
            title: 'tags',
            description: 'list of tags',
          },
          ImageMutability: {
            type: 'boolean',
            title: 'ImageMutability',
            description: 'set image mutability to true or false',
          },
          Region: {
            type: 'string',
            title: 'aws region',
            description: 'aws region to create ECR on',
          },
        },
      },
    },
    async handler(ctx) {
      const setImageMutability = ctx.input.ImageMutability
        ? ImageTagMutability.MUTABLE
        : ImageTagMutability.IMMUTABLE;
      const input: CreateRepositoryCommandInput = {
        repositoryName: ctx.input.RepoName,
        imageTagMutability: setImageMutability,
        tags: ctx.input.Tags,
      };
      const config: ECRClientConfig = {
        region: ctx.input.Region ? ctx.input.Region : 'us-east-1',
        ...(options?.credentials && {
          credentials: await options.credentials(),
        }),
      };
      const createCommand = new CreateRepositoryCommand(input);
      const client = new ECRClient(config);
      try {
        const response = await client.send(createCommand);
        ctx.logger.info(response);
      } catch (e) {
        assertError(e);
        ctx.logger.warn('unable to create ecr repository');
      }
    },
  });
}
