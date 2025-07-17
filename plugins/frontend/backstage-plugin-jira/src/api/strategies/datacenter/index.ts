import { JiraProductStrategy } from '../base';
import { Ticket } from '../../../types';
import { SearchDataCenterResponse } from './types';

export class JiraDataCenterStrategy extends JiraProductStrategy {
  async pagedIssuesRequest(
    apiUrl: string,
    jql: string,
    maxResults?: number,
  ): Promise<Ticket[]> {
    let issues: Ticket[] = [];
    let startAt: number | undefined;
    do {
      const data = {
        jql,
        maxResults: maxResults ?? -1,
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
        startAt,
      };
      const request = await this.options.fetchApi.fetch(`${apiUrl}search`, {
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
      const response: SearchDataCenterResponse = await request.json();
      const lastElement = response.startAt + response.maxResults;
      startAt = response.total > lastElement ? lastElement : undefined;
      issues = issues.concat(response.issues);
    } while (startAt !== undefined);

    return issues;
  }
}
