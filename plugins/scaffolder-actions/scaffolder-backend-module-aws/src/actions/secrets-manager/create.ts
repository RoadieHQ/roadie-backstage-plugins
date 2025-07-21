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
  SecretsManagerClient,
  SecretsManagerClientConfig,
  CreateSecretCommand,
} from '@aws-sdk/client-secrets-manager';
import { CredentialProvider } from '@aws-sdk/types';
import { assertError } from '@backstage/errors';
import { JsonObject } from '@backstage/types';

export function createAwsSecretsManagerCreateAction(options?: {
  credentials?: CredentialProvider;
}): TemplateAction<
  {
    name: string;
    description: string;
    value: string;
    tags: Array<{
      Key: string;
      Value: string;
    }>;
    profile: string;
    region: string;
  },
  JsonObject
> {
  return createTemplateAction({
    id: 'roadiehq:aws:secrets-manager:create',
    description: 'Creates a new secret in AWS Secrets Manager',
    schema: {
      input: {
        name: z => z.string().describe('The name of the secret to be created'),
        region: z => z.string().describe('AWS region to create the secret on'),
        description: z =>
          z
            .string()
            .describe('The description of the secret to be created')
            .optional(),
        value: z =>
          z
            .string()
            .describe('The string value to be encrypted in the new secret')
            .optional(),
        tags: z =>
          z
            .array(
              z.object({
                Key: z.string(),
                Value: z.string(),
              }),
            )
            .optional()
            .describe('AWS tags to be added to the secret'),
        profile: z => z.string().describe('AWS profile to use').optional(),
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
