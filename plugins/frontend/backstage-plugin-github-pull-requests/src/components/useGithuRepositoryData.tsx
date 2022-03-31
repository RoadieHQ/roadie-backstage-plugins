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
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { GithubRepositoryData } from '../types';
import { useBaseUrl } from './useBaseUrl';
import { githubPullRequestsApiRef } from '../api/GithubPullRequestsApi';

export const useGithuRepositoryData = (url: string) => {
  const githubAuthApi = useApi(githubAuthApiRef);
  const api = useApi(githubPullRequestsApiRef);
  const baseUrl = useBaseUrl();

  return useAsync(async (): Promise<GithubRepositoryData> => {
    const token = await githubAuthApi.getAccessToken(['repo']);

    return await api.getRepositoryData({ token, baseUrl, url });
  }, [githubAuthApi]);
};
