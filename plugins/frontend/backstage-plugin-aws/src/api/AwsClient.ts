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

import { AwsApi, GetResourceInput } from './AwsApi';
import { DiscoveryApi } from '@backstage/core-plugin-api';

type Options = {
  discoveryApi: DiscoveryApi;
};
export class AwsClient implements AwsApi {
  private readonly discoveryApi: DiscoveryApi;
  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }

  async getResource(opts: GetResourceInput): Promise<any> {
    const baseUrl = new URL(await this.discoveryApi.getBaseUrl('aws'));
    const getResourseUrl = [
      baseUrl,
      opts.AccountId,
      opts.TypeName,
      opts.Identifier,
    ].join('/');
    const params: { [name: string]: string } = {};
    if (opts.Region) {
      params.region = opts.Region;
    }
    const response = await fetch(
      `${getResourseUrl}?${new URLSearchParams(params)}`
    );
    if (response.status === 200) {
      return await response.json();
    }
    throw new Error(
      `Failed to retrieve the aws resource ${opts.TypeName}/${opts.Identifier}`,
    );
  }
}
