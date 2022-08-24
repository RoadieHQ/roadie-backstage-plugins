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

import { createApiRef } from '@backstage/core-plugin-api';
import { SearchPullRequestsResponseData, GithubRepositoryData } from '../types';

export const githubPullRequestsApiRef = createApiRef<GithubPullRequestsApi>({
  id: 'plugin.githubpullrequests.service',
});

export type GithubPullRequestsApi = {
  listPullRequests: ({
    search,
    token,
    owner,
    repo,
    pageSize,
    page,
    branch,
    baseUrl,
  }: {
    search: string;
    token: string;
    owner: string;
    repo: string;
    pageSize?: number;
    page?: number;
    branch?: string;
    baseUrl: string | undefined;
  }) => Promise<{
    pullRequestsData: SearchPullRequestsResponseData;
  }>;

  getRepositoryData: ({
    baseUrl,
    token,
    url,
  }: {
    baseUrl: string | undefined;
    token: string;
    url: string;
  }) => Promise<GithubRepositoryData>;
};
