/*
 * Copyright 2020 RoadieHQ
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

import { GithubPullRequestsApi } from './GithubPullRequestsApi';
import { Octokit } from '@octokit/rest';
import { PullRequestState, SearchPullRequestsResponseData } from '../types';

export class GithubPullRequestsClient implements GithubPullRequestsApi {
  async listPullRequests({
    search = '',
    token,
    owner,
    repo,
    defaultFilter = '',
    pageSize = 5,
    page,
    state = 'all',
    baseUrl,
  }: {
    search: string;
    token: string;
    owner: string;
    repo: string;
    defaultFilter: string;
    pageSize?: number;
    page?: number;
    state?: PullRequestState;
    baseUrl: string | undefined;
  }): Promise<{
    pullRequestsData: SearchPullRequestsResponseData;
  }> {
    const pullRequestResponse = await new Octokit({
      auth: token,
      ...(baseUrl && { baseUrl }),
    }).search.issuesAndPullRequests({
      q: `${search} in:title type:pr state:${state} ${defaultFilter} repo:${owner}/${repo}`,
      state,
      per_page: pageSize,
      page,
    });
    return {
      pullRequestsData: (pullRequestResponse.data as any) as SearchPullRequestsResponseData,
    };
  }
}
