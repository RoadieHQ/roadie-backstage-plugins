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

import { GithubPullRequestsApi } from './GithubPullRequestsApi';
import { Octokit } from '@octokit/rest';
import { SearchPullRequestsResponseData, GithubRepositoryData } from '../types';

export class GithubPullRequestsClient implements GithubPullRequestsApi {
  async listPullRequests({
    search = '',
    token,
    owner,
    repo,
    pageSize = 5,
    page,
    baseUrl,
  }: {
    search: string;
    token: string;
    owner: string;
    repo: string;
    pageSize?: number;
    page?: number;
    baseUrl: string | undefined;
  }): Promise<{
    pullRequestsData: SearchPullRequestsResponseData;
  }> {
    const pullRequestResponse = await new Octokit({
      auth: token,
      ...(baseUrl && { baseUrl }),
    }).search.issuesAndPullRequests({
      q: `${search} in:title type:pr repo:${owner}/${repo}`,
      per_page: pageSize,
      page,
    });
    return {
      pullRequestsData:
        pullRequestResponse.data as any as SearchPullRequestsResponseData,
    };
  }
  async getRepositoryData({
    baseUrl,
    token,
    url,
  }: {
    baseUrl: string | undefined;
    token: string;
    url: string;
  }): Promise<GithubRepositoryData> {
    const response = await new Octokit({
      auth: token,
      ...(baseUrl && { baseUrl }),
    }).request({ url: url });

    return {
      htmlUrl: response.data.html_url,
      fullName: response.data.full_name,
      additions: response.data.additions,
      deletions: response.data.deletions,
      changedFiles: response.data.changed_files,
    };
  }
}
