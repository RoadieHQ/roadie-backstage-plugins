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

import { useAsync } from 'react-use';
import { Octokit } from '@octokit/rest';
import {
  useApi,
  githubAuthApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { RequestError } from '@octokit/request-error';

const BASE_URL = 'https://api.github.com';
const state = { etag: undefined, data: '' };

export const useGithubFile = () => {
  const auth = useApi(githubAuthApiRef);
  const configApi = useApi(configApiRef);

  const owner = configApi.getConfig('homePageMarkdown').getString('owner');
  const repo = configApi.getConfig('homePageMarkdown').getString('repo');
  const path = configApi.getConfig('homePageMarkdown').getString('path');
  const ref = configApi.getConfig('homePageMarkdown').getOptionalString('ref');

  const { value, loading, error } = useAsync(async (): Promise<any> => {
    let result;
    try {
      const token = await auth.getAccessToken(['repo']);
      const octokit = new Octokit({ auth: token });

      const response = await octokit.request(
        `GET /repos/{owner}/{repo}/contents/${path}`,
        {
          headers: { 'if-none-match': state.etag },
          baseUrl: BASE_URL,
          owner,
          repo,
          ...(ref && { ref }),
        },
      );

      const data = response.data;

      result = {
        data,
        etag: response.headers.etag ?? '',
      };
    } catch (e) {
      if (e instanceof RequestError) {
        if (e.status === 304) {
          result = state;
        }
      }
    }
    return result;
  }, []);

  if (value) {
    state.etag = value.etag;
    state.data = value.data;
  }

  return {
    value: value ? value.data : undefined,
    loading,
    error,
  };
};
