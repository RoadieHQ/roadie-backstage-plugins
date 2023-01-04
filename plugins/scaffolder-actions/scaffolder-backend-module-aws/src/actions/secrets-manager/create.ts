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
  SecretsManagerClient,
  SecretsManagerClientConfig,
  CreateSecretCommand,
} from '@aws-sdk/client-secrets-manager';
import { CredentialProvider } from '@aws-sdk/types';
import { assertError } from '@backstage/errors';

export function createAwsSecretsManagerCreateAction(options?: {
  credentials?: CredentialProvider;
}) {
  return createTemplateAction<{
    name: string;
    description: string;
    value: string;
    tags: Array<{ Key: string; Value: string }>;
    profile: string;
    region: string;
  }>({
    id: 'roadiehq:aws:secrets-manager:create',
    description: 'Creates a new secret in AWS Secrets Manager',
    schema: {
      input: {
        required: ['name', 'region'],
        type: 'object',
        properties: {
          name: {
            title: 'Secret name',
            description: 'The name of the secret to be created',
            type: 'string',
          },
          description: {
            title: 'Secret description',
            description: 'The description of the secret to be created',
            type: 'string',
            required: false,
          },
          value: {
            title: 'Secret value',
            description: 'The string value to be encrypted in the new secret',
            type: 'string',
            required: false,
          },
          tags: {
            title: 'Tags',
            description: 'AWS tags to be added to the secret',
            type: 'array',
            required: false,
            items: {
              type: 'object',
              properties: {
                Key: {
                  type: 'string',
                },
                Value: {
                  type: 'string',
                },
              },
            },
          },
          profile: {
            title: 'AWS profile',
            description: 'AWS profile to use',
            type: 'string',
            required: false,
          },
          region: {
            title: 'Region',
            description: 'AWS region to create the secret on',
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const config: SecretsManagerClientConfig & {
        profile?: string;
        region?: string;
      } = {
        ...(options?.credentials && {
          credentials: await options.credentials(),
        }),
        profile: ctx.input.profile,
        region: ctx.input.region,
      };

      const secretsManagerClient = new SecretsManagerClient(config);

      try {
        await secretsManagerClient.send(
          new CreateSecretCommand({
            Name: ctx.input.name,
            Description: ctx.input.description,
            SecretString: ctx.input.value,
            Tags: ctx.input.tags,
          }),
        );
        ctx.logger.info(`secret successfully created: ${ctx.input.name}`);
      } catch (e) {
        assertError(e);
        ctx.logger.error('Error creating secret:', e);
      }
    },
  });
}
