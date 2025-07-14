/*
 * Copyright 2025 Larder Software Limited
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
import { PullRequestsListView, SkeletonPullRequestsListView } from '../../PullRequestsListView';
import { useGithubSearchPullRequest } from '../../useGithubSearchPullRequest';
import Alert from '@material-ui/lab/Alert';
import { GitHubAuthorizationWrapper } from '@roadiehq/github-auth-utils-react';

type OpenPullRequestsCardProps = {
  query?: string;
  hostname?: string;
};

const defaultPullRequestsQuery = 'is:open is:pr author:@me archived:false';

const OpenPullRequestsContent = (props: OpenPullRequestsCardProps) => {
  const { query = defaultPullRequestsQuery, hostname } = props;
  const { loading, error, value } = useGithubSearchPullRequest(query, hostname);

  if (loading) return <SkeletonPullRequestsListView />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <PullRequestsListView
      data={value}
      emptyStateText="No open pull requests."
    />
  );
};

export const Content = (props: OpenPullRequestsCardProps) => {
  return (
    <GitHubAuthorizationWrapper
      title="Your Pull Requests"
      hostname={props.hostname}
    >
      <OpenPullRequestsContent {...props} />
    </GitHubAuthorizationWrapper>
  );
};
