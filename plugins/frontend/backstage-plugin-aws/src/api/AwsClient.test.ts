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

import { AwsClient } from './AwsClient';
import { UrlPatternDiscovery } from "@backstage/core-app-api";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');

describe('AwsClient', () => {
    let client: AwsClient;


    beforeEach(() => {
        fetchMock.resetMocks();
        client = new AwsClient({ discoveryApi });
    })

    describe('the resource does not exist', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
            fetchMock.mockIf(/^https?:\/\/exampleapi.com.*$/, async () => {
                return {
                    status: 404,
                    body: "Not Found"
                }
            })
        })
        it('returns an error if the resource is not found', async () => {
            await expect(client.getResource({
                TypeName: 'AWS::S3::Bucket',
                Identifier: 'bucket1',
                AccountId: '999999999'
            })).rejects.toEqual(new Error('Failed to retrieve the aws resource AWS::S3::Bucket/bucket1'));
        })
    })

    describe('the resource exists', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
            fetchMock.mockIf(/^https?:\/\/exampleapi.com.*$/, async () => {
                return {
                    status: 200,
                    body: JSON.stringify({ BucketId: '1234' })
                }
            })
        })
        it('returns an error if the resource is not found', async () => {
            await expect(client.getResource({
                TypeName: 'AWS::S3::Bucket',
                Identifier: 'bucket1',
                AccountId: '999999999'
            })).resolves.toEqual({ BucketId: '1234' });
        })
    })
});