import { Octokit } from '@octokit/rest';
import { GetResponseTypeFromEndpointMethod } from '@octokit/types';
import { SearchIssuesAndPullRequestsResponseData } from '@octokit/types';

const octokit = new Octokit();

export type PullRequestState = 'open' | 'closed' | 'all';

export type SearchPullRequestsResponseDataItems = {
  items: Array<
    Omit<
      SearchIssuesAndPullRequestsResponseData['items'][number],
      'pull_request'
    > & {
      draft: boolean;
      pull_request: {
        html_url: string;
        diff_url: string;
        patch_url: string;
        merged_at: string | null;
        url: string;
      };
      user: {
        login: string | null;
        html_url: string;
      } | null;
    }
  >;
};

export type SearchPullRequestsResponseData = Omit<
  SearchIssuesAndPullRequestsResponseData,
  'items'
> &
  SearchPullRequestsResponseDataItems;

export type GetSearchPullRequestsResponseType =
  GetResponseTypeFromEndpointMethod<
    typeof octokit.search.issuesAndPullRequests
  >;

export type GithubSearchPullRequestsDataItem = {
  id: number;
  state: string;
  draft: boolean;
  merged?: string;
  repositoryUrl: string;
  pullRequest: {
    htmlUrl?: string;
  };
  title: string;
  number: number;
  user: {
    login?: string;
    htmlUrl?: string;
  };
  comments: number;
  htmlUrl: string;
};

export type GithubRepositoryData = {
  htmlUrl: string;
  fullName: string;
  additions: number;
  deletions: number;
  changedFiles: number;
};
