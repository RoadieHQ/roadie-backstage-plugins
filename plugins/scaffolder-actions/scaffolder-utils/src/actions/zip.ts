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
import path from 'path'
import AdmZip from "adm-zip"
import fs from 'fs';

export function createZipAction() {
    return createTemplateAction<{ path: string, outputPath: string }>({
        id: "roadiehq:utils:zip",
        description: "Zips the content of the path",
        schema: {
            input: {
                required: ['path'],
                type: 'object',
                properties: {
                    path: {
                        title: 'Path',
                        description: 'Relative path you would like to zip',
                        type: 'string',
                    },

                    outputPath: {
                        title: 'Output Path',
                        description: 'The name of the result of the zip command',
                        type: 'string',
                    },
                }
            },
            output: {
                type: 'object',
                properties: {
                    outputPath: {
                        title: 'Zip Path',
                        type: 'string'
                    }
                }
            }
        },
        async handler(ctx) {
            const zip = new AdmZip()
            const resultPath = path.join(ctx.workspacePath, ctx.input.path)
            const outputPath = path.join(ctx.workspacePath, ctx.input.outputPath)

            if (!fs.existsSync(resultPath)) {
                ctx.logger.error(`File ${ctx.input.path} does not exists. Can't zip it.`)
                return
            }
            if (fs.lstatSync(resultPath).isDirectory()) {
                zip.addLocalFolder(resultPath)
            } else if (fs.lstatSync(resultPath).isFile()) {
                zip.addLocalFile(resultPath)
            }
            zip.writeZip(outputPath)

            ctx.output('outputPath', ctx.input.outputPath)
        }
    })
}