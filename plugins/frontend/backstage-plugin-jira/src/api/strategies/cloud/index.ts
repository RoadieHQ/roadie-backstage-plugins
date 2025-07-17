import { JiraProductStrategy } from '../base';
import { Ticket } from '../../../types';
import { IssuesCloudResponse } from './types';

export class JiraCloudStrategy extends JiraProductStrategy {
  async pagedIssuesRequest(
    apiUrl: string,
    jql: string,
    maxResults?: number,
  ): Promise<Ticket[]> {
    let issues: Ticket[] = [];
    let nextPageToken: string | undefined;
    do {
      const data = {
        jql,
        maxResults: maxResults ?? 5000,
        fields: [
          'key',
          'issuetype',
          'summary',
          'status',
          'assignee',
          'priority',
          'parent',
          'created',
          'updated',
          'project',
        ],
        nextPageToken,
      };
      const request = await this.options.fetchApi.fetch(`${apiUrl}search/jql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!request.ok) {
        throw new Error(
          `failed to fetch data, status ${request.status}: ${request.statusText}`,
        );
      }
      const response: IssuesCloudResponse = await request.json();
      nextPageToken = response.nextPageToken;
      issues = issues.concat(response.issues);
    } while (nextPageToken !== undefined);

    return issues;
  }
}
