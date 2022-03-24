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
import React from 'react';

import { PullRequestsListView } from '../../PullRequestsListView';
import { useGithubSearch } from '../../useGithubSearch';
import { Progress } from '@backstage/core-components';

export const Content = () => {
  const { loading, error, value } = useGithubSearch(
    `is:open type:pr review-requested:@me archived:false`,
  );

  if (loading) return <Progress />;
  if (error) return <>Error...</>;

  if (value) {
    if (value.items.length < 1) {
      return <>You are all set! You don't have review requests</>;
    }
    return (
      <PullRequestsListView
        data={value.items}
        loading={loading}
        pageSize={5}
        page={0}
      />
    );
  }

  return <div>PRs</div>;
};
