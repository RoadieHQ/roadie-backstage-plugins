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
import { useEffect, useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { githubPullRequestsApiRef } from '../api/GithubPullRequestsApi';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { PullsListResponseData } from '@octokit/types';
import moment from 'moment';
import { PullRequestState } from '../types';
import { useBaseUrl } from '../components/useBaseUrl';

export type PullRequest = {
  id: number;
  number: number;
  url: string;
  title: string;
  updatedTime: string;
  createdTime: string;
  state: string;
  draft: boolean;
  merged: string | null;
  creatorNickname: string;
  creatorProfileLink: string;
};

export function usePullRequests({
  owner,
  repo,
  branch,
  state,
  isPrivate = false,
}: {
  owner: string;
  repo: string;
  branch?: string;
  state?: PullRequestState;
  isPrivate?: boolean;
}) {
  const api = useApi(githubPullRequestsApiRef);
  const auth = useApi(githubAuthApiRef);
  const baseUrl = useBaseUrl();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const getElapsedTime = (start: string) => {
    return moment(start).fromNow();
  };

  const { loading, value: prData, retry, error } = useAsyncRetry<
    PullRequest[]
  >(async () => {
    if (!repo) {
      return [];
    }
    return api
      .listPullRequests({
        token: isPrivate ? await auth.getAccessToken(['repo']) : undefined,
        owner,
        repo,
        pageSize,
        page: page + 1,
        branch,
        state,
        baseUrl,
      })
      .then(
        ({
          maxTotalItems,
          pullRequestsData,
        }: {
          maxTotalItems?: number;
          pullRequestsData: PullsListResponseData;
        }) => {
          if (maxTotalItems) {
            setTotal(maxTotalItems);
          }

          return pullRequestsData.map(
            ({
              id,
              html_url,
              title,
              number,
              created_at,
              updated_at,
              user,
              state: pr_state,
              draft,
              merged_at,
            }) => ({
              url: html_url,
              id,
              number,
              title,
              state: pr_state,
              draft,
              merged: merged_at,
              creatorNickname: user.login,
              creatorProfileLink: user.html_url,
              createdTime: getElapsedTime(created_at),
              updatedTime: getElapsedTime(updated_at),
            }),
          );
        },
      );
  }, [page, pageSize, repo, owner]);

  useEffect(() => {
    setPage(0);
    retry();
  }, [state]);

  return [
    {
      page,
      pageSize,
      loading,
      prData,
      projectName: `${owner}/${repo}`,
      total,
      error,
    },
    {
      prData,
      setPage,
      setPageSize,
      retry,
    },
  ] as const;
}
