import { SearchIssuesAndPullRequestsResponseData } from '@octokit/types';

export type PullRequestState = 'open' | 'closed' | 'all';

export type SearchPullRequestsResponseDataItems = {
    items: Array<
        Omit<SearchIssuesAndPullRequestsResponseData['items'][number], "pull_request"> & {
            draft: boolean;
            pull_request: {
                html_url: string;
                diff_url: string;
                patch_url: string;
                merged_at: string | null;
            };
        }>
}

export type SearchPullRequestsResponseData = Omit<SearchIssuesAndPullRequestsResponseData, "items"> & SearchPullRequestsResponseDataItems;
import { Dispatch, SetStateAction } from "react";

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
    created_at: string;
    closed_at: string;
    creatorNickname: string;
    creatorProfileLink: string;
};
export type PrStateData = {
    etag: string;
    data: PullRequest[];
}
export type PrState = {
    open: PrStateData;
    closed: PrStateData;
    all: PrStateData;
}

export type PullRequestsContextData = {
    prState: PrState,
    setPrState: Dispatch<SetStateAction<PrState>>
}
