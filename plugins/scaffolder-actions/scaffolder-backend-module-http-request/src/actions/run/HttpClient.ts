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

import {Logger} from "winston";
import {fetch} from "cross-fetch";

class HttpError extends Error {}
const DEFAULT_TIMEOUT = 60_000;

export type HttpBackstageRequestAuthorizer = (request: RequestInit) => RequestInit

export class HttpClient {
    private readonly logger: Logger;
    private readonly authorizer: HttpBackstageRequestAuthorizer;
    constructor({ logger, authorizer }: { logger: Logger, authorizer: HttpBackstageRequestAuthorizer }) {
        this.logger = logger;
        this.authorizer = authorizer;
    }

    async request(url: string, options: RequestInit) {
        let res: any;
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)
        const httpOptions = {...options, signal: controller.signal}

        try {
            res = await fetch(url, this.authorizer(httpOptions));
            if(!res){
                throw new HttpError(`Request was aborted as it took longer than ${DEFAULT_TIMEOUT/1000} seconds`);
            }
        } catch (e) {
            throw new HttpError(`There was an issue with the request: ${e}`);
        }

        clearTimeout(timeoutId);

        const headers: any = {};
        for (const [name, value] of res.headers) {
            headers[name] = value;
        }

        const isJSON = () => headers['content-type'] &&
            headers['content-type'].includes('application/json');

        let body;
        try {
            body = isJSON() ? await res.json() : { message: await res.text() };
        } catch (e) {
            throw new HttpError(`Could not get response: ${e}`);
        }

        if (res.status >= 400) {
            this.logger.error(
                `There was an issue with your request. Status code: ${res.status} Response body: ${JSON.stringify(body)}`
            );
            throw new HttpError('Unable to complete request');
        }
        return { code: res.status, headers, body };
    }
}
