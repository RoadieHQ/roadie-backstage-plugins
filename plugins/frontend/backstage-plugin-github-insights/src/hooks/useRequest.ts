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

import { useEffect } from 'react';
import { useAsync } from 'react-use';
import { Octokit } from '@octokit/rest';
import { Entity } from '@backstage/catalog-model';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { useProjectEntity } from './useProjectEntity';
import { useEntityGithubScmIntegration } from './useEntityGithubScmIntegration';
import { useGithubInsights } from '../components/GithubInsightsContext';
import { RequestError } from "@octokit/request-error";


export const useRequest = (
  entity: Entity,
  requestName: string,
  perPage: number = 0,
  maxResults: number = 0,
  showTotal: boolean = false,
) => {
  const auth = useApi(githubAuthApiRef);
  const { baseUrl } = useEntityGithubScmIntegration(entity);
  const { owner, repo } = useProjectEntity(entity);

  const { request } = useGithubInsights()
  const { requestState, setRequestState } = request

  const { value, loading, error } = useAsync(async (): Promise<any> => {
    try {
      const token = await auth.getAccessToken(['repo']);
      const octokit = new Octokit({ auth: token });

      const response = await octokit.request(
        `GET /repos/{owner}/{repo}/${requestName}`,
        {
          headers: { "if-none-match": requestState[requestName].etag },
          baseUrl,
          owner,
          repo,
          ...(perPage && { per_page: perPage }),
        },
      );

      if (response.headers.etag) {
        setRequestState((current) => ({
          ...current,
          ...{ [requestName]: { ...current[requestName], etag: response.headers.etag } }
        }))
      }
      const data = response.data;

      if (showTotal) {
        if (Object.values(data).length === 0) return null;
        return {
          data,
          total: Object.values(data as Record<string, number>).reduce(
            (a, b) => a + b,
          ),
        };
      }
      return maxResults ? data.slice(0, maxResults) : data;
    } catch (e) {
      if (e instanceof RequestError) {
        if (e.status === 304) {
          return requestState[requestName].data
        }
      }
    }
  }, [baseUrl]);

  useEffect(() => {
    setRequestState((current) => ({ ...current, ...{ [requestName]: { ...current[requestName], data: value } } }))
  }, [value])

  return {
    value,
    loading,
    error,
  };
};
