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
import { useMemo } from 'react';
import moment from 'moment';
import { PullRequestState, PullRequest, SearchPullRequestsResponseData } from '../types';
import { usePullRequests } from './usePullRequests';

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
      acc.avgTimeUntilMerge += curr.merged
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
  const [{ loading, prData, error }, _] = usePullRequests({ owner, repo, branch, state, pageSize: Math.max(pageSize, 20) })


  const calcResult = useMemo(() => calculateStatistics(prData.slice(0, pageSize)), [prData, pageSize]);

  let statsData;
  if (calcResult.closedCount === 0 || calcResult.mergedCount === 0) {
    statsData = {
      avgTimeUntilMerge: 'Never',
      mergedToClosedRatio: '0%',
    }

  } else {

    const avgTimeUntilMergeDiff = moment.duration(
      calcResult.avgTimeUntilMerge / calcResult.mergedCount,
    );

    const avgTimeUntilMerge = avgTimeUntilMergeDiff.humanize();
    statsData = {
      avgTimeUntilMerge: avgTimeUntilMerge,
      mergedToClosedRatio: `${Math.round(
        (calcResult.mergedCount / calcResult.closedCount) * 100,
      )}%`,
    }

  }

  return [
    {
      loading,
      statsData,
      projectName: `${owner}/${repo}`,
      error,
    },
  ] as const;
}
