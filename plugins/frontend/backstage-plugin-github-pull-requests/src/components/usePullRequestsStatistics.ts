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

import { useAsyncRetry } from 'react-use';
import { githubPullRequestsApiRef } from '../api/GithubPullRequestsApi';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import moment from 'moment';
import { useBaseUrl } from './useBaseUrl';
import { PullRequestState, SearchPullRequestsResponseData } from '../types';

export type PullRequestStats = {
  avgTimeUntilMerge: string;
  mergedToClosedRatio: string;
};

export type PullRequestStatsCount = {
  avgTimeUntilMerge: number;
  closedCount: number;
  mergedCount: number;
};
function calculateStatistics(pullRequestsData: SearchPullRequestsResponseData) {
  return pullRequestsData.items.reduce<PullRequestStatsCount>(
    (acc, curr) => {
      acc.avgTimeUntilMerge += curr.pull_request.merged_at
        ? new Date(curr.pull_request.merged_at).getTime() -
          new Date(curr.created_at).getTime()
        : 0;
      acc.mergedCount += curr.pull_request.merged_at ? 1 : 0;
      acc.closedCount += curr.closed_at ? 1 : 0;
      return acc;
    },
    {
      avgTimeUntilMerge: 0,
      closedCount: 0,
      mergedCount: 0,
    },
  );
}
export function usePullRequestsStatistics({
  owner,
  repo,
  branch,
  pageSize,
  state,
}: {
  owner: string;
  repo: string;
  branch?: string;
  pageSize: number;
  state: PullRequestState;
}) {
  const api = useApi(githubPullRequestsApiRef);
  const auth = useApi(githubAuthApiRef);
  const baseUrl = useBaseUrl();

  const { loading, value: statsData, error } = useAsyncRetry<
    PullRequestStats
  >(async () => {
    const token = await auth.getAccessToken(['repo']);
    if (!repo) {
      return {
        avgTimeUntilMerge: 'Never',
        mergedToClosedRatio: '0%',
      };
    }
    return api
      .listPullRequests({
        search: `state:${state}`,
        token,
        owner,
        repo,
        pageSize,
        page: 1,
        branch,
        baseUrl,
      })
      .then(
        ({ pullRequestsData }: { pullRequestsData: SearchPullRequestsResponseData }) => {
          const calcResult = calculateStatistics(pullRequestsData);
          if(calcResult.closedCount === 0 || calcResult.mergedCount === 0) return {
            avgTimeUntilMerge: 'Never',
            mergedToClosedRatio: '0%',
          }
          const avgTimeUntilMergeDiff = moment.duration(
            calcResult.avgTimeUntilMerge / calcResult.mergedCount,
          );

          const avgTimeUntilMerge = avgTimeUntilMergeDiff.humanize();
          return {
            avgTimeUntilMerge: avgTimeUntilMerge,
            mergedToClosedRatio: `${Math.round(
              (calcResult.mergedCount / calcResult.closedCount) * 100,
            )}%`,
          }
        },
      );
  }, [pageSize, repo, owner]);

  return [
    {
      loading,
      statsData,
      projectName: `${owner}/${repo}`,
      error,
    },
  ] as const;
}
