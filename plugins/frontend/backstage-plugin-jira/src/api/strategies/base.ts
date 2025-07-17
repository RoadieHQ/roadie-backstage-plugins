import { FetchApi } from '@backstage/core-plugin-api';
import { Ticket } from '../../types';

export type JiraProductStrategyOptions = {
  fetchApi: FetchApi;
};

export abstract class JiraProductStrategy {
  constructor(protected options: JiraProductStrategyOptions) {}

  abstract pagedIssuesRequest(apiUrl: string, jql: string, maxResults?: number): Promise<Ticket[]>;
}
