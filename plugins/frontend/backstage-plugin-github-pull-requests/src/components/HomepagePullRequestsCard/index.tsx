import React from 'react';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { Octokit } from '@octokit/rest';
import { useAsync } from 'react-use';
import { PullRequestsTableView } from '../PullRequestsTable';

export const HomePageRequestedReviewsCard = () => {
  const auth = useApi(githubAuthApiRef);

  const { loading, error, value } = useAsync(async () => {
    const token = await auth.getAccessToken(['repo']);
    const identity = await auth.getBackstageIdentity();

    const pullRequestResponse = await new Octokit({
      auth: token,
      baseUrl: 'https://api.github.com',
    }).search.issuesAndPullRequests({
      q: `is:closed is:pr review-requested:${identity.id} archived:false`,
      per_page: 5,
      page: 1,
    });
    console.log(pullRequestResponse.data);
    return pullRequestResponse.data;
  }, [auth]);

  if (loading) return <>Loading...</>;
  if (error) return <>Error...</>;

  if (value) {
    return (
      <PullRequestsTableView
        prData={value.items}
        loading={loading}
        pageSize={5}
        page={1}
        projectName="Requested reviews from you"
      />
    );
  }
  return <div>PRs</div>;
};

export const HomePageYourOpenPullRequestsCard = () => {
  const auth = useApi(githubAuthApiRef);

  const { loading, error, value } = useAsync(async () => {
    const token = await auth.getAccessToken(['repo']);
    const identity = await auth.getBackstageIdentity();

    const pullRequestResponse = await new Octokit({
      auth: token,
      baseUrl: 'https://api.github.com',
    }).search.issuesAndPullRequests({
      q: `is:open is:pr author:${identity.id} archived:false`,
      per_page: 5,
      page: 1,
    });
    console.log(pullRequestResponse.data);
    return pullRequestResponse.data;
  }, [auth]);

  if (loading) return <>Loading...</>;
  if (error) return <>Error...</>;

  if (value) {
    return (
      <PullRequestsTableView
        prData={value.items}
        loading={loading}
        pageSize={5}
        page={1}
        projectName="Your open pull requests"
      />
    );
  }
  return <div>PRs</div>;
};
