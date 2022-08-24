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
import { S3Client, PutObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import fs, { createReadStream } from 'fs-extra';
import { resolveSafeChildPath } from '@backstage/backend-common';
import glob from 'glob';
import { CredentialProvider } from '@aws-sdk/types';
import { assertError } from '@backstage/errors';

export function createAwsS3CpAction(options?: {
  credentials?: CredentialProvider;
}) {
  return createTemplateAction<{
    bucket: string;
    region: string;
    path?: string;
    prefix?: string;
    endpoint?: string;
    s3ForcePathStyle?: boolean;
  }>({
    id: 'roadiehq:aws:s3:cp',
    description: 'Copies the path to the given bucket',
    schema: {
      input: {
        required: ['bucket', 'region'],
        type: 'object',
        properties: {
          path: {
            title: 'Path',
            description:
              'A Glob pattern that lists the files to upload. Defaults to everything in the workspace',
            type: 'string',
          },
          bucket: {
            title: 'Bucket',
            description: 'The bucket to copy the given path',
            type: 'string',
          },
          region: {
            title: 'Region',
            description: 'AWS region',
            type: 'string',
          },
          prefix: {
            title: 'Prefix',
            description: 'Prefix to use in the s3 key.',
            type: 'string',
          },
          endpoint: {
            title: 'Endpoint',
            description: 'The fully qualified endpoint of the webservice. ',
            type: 'string',
          },
          s3ForcePathStyle: {
            title: 'Force Path Style',
            description: 'Whether to force path style URLs for S3 objects',
            type: 'boolean',
          },
        },
      },
    },
    async handler(ctx) {
      const config: S3ClientConfig = {
        ...(options?.credentials && {
          credentials: await options.credentials(),
        }),
        region: ctx.input.region,
        forcePathStyle: ctx.input.s3ForcePathStyle,
        endpoint: ctx.input.endpoint,
      };

      const prefix = ctx.input?.prefix || '';

      const s3Client = new S3Client(config);

      const files = glob
        .sync(
          resolveSafeChildPath(
            ctx.workspacePath,
            ctx.input.path ? `${ctx.input.path}/**` : '**',
          ),
        )
        .filter(filePath => fs.lstatSync(filePath).isFile());

      try {
        await Promise.all(
          files.map((filePath: string) => {
            return s3Client.send(
              new PutObjectCommand({
                Bucket: ctx.input.bucket,
                Key:
                  (prefix ? `${prefix}/` : '') +
                  filePath.replace(`${ctx.workspacePath}/`, ''),
                Body: createReadStream(filePath),
              }),
            );
          }),
        );
      } catch (e) {
        assertError(e);
        ctx.logger.warn("wasn't able to upload the whole context");
      }
      ctx.logger.info(
        `successfully uploaded the following file(s): ${files
          .map(f => f.replace(`${ctx.workspacePath}/`, ''))
          .join('\n')}`,
      );
    },
  });
}
