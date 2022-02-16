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
import { S3Client, PutObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { createReadStream } from "fs-extra";
import { resolveSafeChildPath } from '@backstage/backend-common';
import glob from "glob"

export function createAwsS3CpAction() {
    return createTemplateAction<{ path?: string, bucket: string }>({
        id: "roadiehq:aws:s3:cp",
        description: "Copies the path to the given bucket",
        schema: {
            input: {
                required: ["bucket"],
                type: 'object',
                properties: {
                    path: {
                        title: 'Path',
                        description: 'Relative path',
                        type: 'string',
                    },
                    bucket: {
                        title: 'Bucket',
                        description: 'The bucket to copy the given path',
                        type: 'string'
                    }
                }
            },
            output: {
                type: 'object',
                properties: {
                    path: {
                        title: 'Path',
                        type: 'string'
                    }
                }
            }
        },
        async handler(ctx) {
            const s3Client = new S3Client({ region: "euw" });

            const files = glob.sync(resolveSafeChildPath(ctx.workspacePath, ctx.input.path || ""))

            try {
                Promise.all(files.map((filePath: string) => {
                    return s3Client.send(new PutObjectCommand({
                        Bucket: ctx.input.bucket,
                        Key: ctx.input.path,
                        Body: createReadStream(filePath)
                    }))

                }))
            } catch (e) {
                console.log(e)
            }

        }
    })
}