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
import { Octokit } from '@octokit/rest';
import { useAsync } from 'react-use';
import {
  GetSearchPullRequestsResponseType,
  GithubSearchPullRequestsDataItem,
} from '../types';
import { useBaseUrl } from './useBaseUrl';

export const useGithubSearchPullRequest = (query: string) => {
  const githubAuthApi = useApi(githubAuthApiRef);
  const baseUrl = useBaseUrl();

  return useAsync(async (): Promise<GithubSearchPullRequestsDataItem[]> => {
    const token = await githubAuthApi.getAccessToken(['repo']);

    const pullRequestResponse: GetSearchPullRequestsResponseType =
      await new Octokit({
        auth: token,
        ...(baseUrl && { baseUrl }),
      }).search.issuesAndPullRequests({
        q: query,
        per_page: 5,
        page: 1,
      });
    return pullRequestResponse.data.items.map(pr => ({
      id: pr.id,
      state: pr.state,
      draft: pr.draft ?? false,
      merged: pr.pull_request?.merged_at ?? undefined,
      repositoryUrl: pr.repository_url,
      pullRequest: {
        htmlUrl: pr.pull_request?.html_url || undefined,
      },
      title: pr.title,
      number: pr.number,
      user: {
        login: pr.user?.login,
        htmlUrl: pr.user?.html_url,
      },
      comments: pr.comments,
      htmlUrl: pr.html_url,
    }));
  }, [githubAuthApi]);
};
