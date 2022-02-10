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
import { Config } from '@backstage/config';
import fetch from "cross-fetch"


export function createGithubReposCreateAction(options: { config: Config }) {
    const { config } = options;
    return createTemplateAction<{ name: string }>({
        id: "roadiehq:github:repos:create",
        description: "Creates a github repository",
        schema: {
            input: {
                type: 'object',
                properties: {
                    name: {
                        title: 'Repo name',
                        description: 'Name of the repository',
                        type: 'string',
                    },
                    private: {
                        type: "string"
                    },
                    team_id: {
                        type: "number"
                    }
                }
            },
        },
        async handler(ctx) {

        }
    })
}