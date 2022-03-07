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
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { RequestError } from '@octokit/request-error';
import { MarkdownContentProps } from './Content';

const BASE_URL = 'https://api.github.com';
const cache = { etag: undefined, data: '' };

export const useGithubFile = (props: MarkdownContentProps) => {
  const auth = useApi(githubAuthApiRef);
  const { owner, repo, path, branch } = props;
  const { value, loading, error } = useAsync(async (): Promise<any> => {
    let result;
    try {
      const token = await auth.getAccessToken(['repo']);
      const octokit = new Octokit({ auth: token });

      const response = await octokit.request(
        `GET /repos/{owner}/{repo}/contents/${path}`,
        {
          headers: { 'if-none-match': cache.etag },
          baseUrl: BASE_URL,
          owner,
          repo,
          ...(branch && { ref: branch }),
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
          result = cache;
        }
      }
    }
    return result;
  }, []);

  if (value) {
    cache.etag = value.etag;
    cache.data = value.data;
  }

  return {
    value: value ? value.data : undefined,
    loading,
    error,
  };
};
