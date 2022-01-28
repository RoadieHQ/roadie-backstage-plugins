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
<<<<<<< HEAD
import { Octokit } from '@octokit/rest';
import { SearchPullRequestsResponseData } from '../types';
=======
import { PullsListResponseData } from '@octokit/types';
import { PullRequestState } from '../types';
import { createTokenAuth } from "@octokit/auth-token"
import { request } from "@octokit/request"
import { createUnauthenticatedAuth } from "@octokit/auth-unauthenticated"
>>>>>>> 92a7fad (SC-6275  make filtering on the frontend)

export class GithubPullRequestsClient implements GithubPullRequestsApi {
  async listPullRequests({
    search = '',
    token,
    owner,
    repo,
    pageSize = 5,
    page,
    baseUrl,
    etag
  }: {
    search: string;
    token: string;
    owner: string;
    repo: string;
    pageSize?: number;
    page?: number;
    baseUrl: string | undefined;
    etag: string
  }): Promise<{
    pullRequestsData: SearchPullRequestsResponseData;
    etag?: string
  }> {
    console.log(typeof token, "TOKEN?")
    const pullRequestResponse = await new Octokit({
      auth: token,
      ...(baseUrl && { baseUrl }),
    }).search.issuesAndPullRequests({
      q: `${search} in:title type:pr repo:${owner}/${repo}`,
      per_page: pageSize,
      page,
      headers: {
        "if-none-match": etag,
      },
    });
    return {
      pullRequestsData: (pullRequestResponse.data as any) as SearchPullRequestsResponseData,
    };
  }
}
