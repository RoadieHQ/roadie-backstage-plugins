export type PullRequestState = 'open' | 'closed' | 'all';

export type SearchPullRequestsResponseData = {
    total_count: number;
    incomplete_results: boolean;
    items: {
        url: string;
        repository_url: string;
        labels_url: string;
        comments_url: string;
        events_url: string;
        html_url: string;
        id: number;
        node_id: string;
        number: number;
        title: string;
        user: {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
        };
        labels: {
            id: number;
            node_id: string;
            url: string;
            name: string;
            color: string;
        }[];
        state: string;
        assignee: string;
        milestone: string;
        comments: number;
        created_at: string;
        updated_at: string;
        closed_at: string;
        draft: boolean;
        pull_request: {
            html_url: string;
            diff_url: string;
            patch_url: string;
            merged_at: string | null;
        };
        body: string;
        score: number;
    }[];
}