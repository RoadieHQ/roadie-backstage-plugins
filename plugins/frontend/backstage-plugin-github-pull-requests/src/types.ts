import { SearchIssuesAndPullRequestsResponseData } from '@octokit/types';

export type PullRequestState = 'open' | 'closed' | 'all';

export type SearchPulLRequestsResponseDataItems = {
  items: Array<
    Omit<SearchIssuesAndPullRequestsResponseData['items'][number], "pull_request"> & {
      draft:boolean;
      pull_request: {
        html_url: string;
        diff_url: string;
        patch_url: string;
        merged_at: string | null;
      };
    }>
}

export type SearchPullRequestsResponseData = Omit<SearchIssuesAndPullRequestsResponseData, "items"> &  SearchPulLRequestsResponseDataItems;
