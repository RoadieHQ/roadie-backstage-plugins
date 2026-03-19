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

import { JiraProductStrategy } from '../base';
import { Ticket } from '../../../types';
import { SearchCloudResponse } from './types';

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
      const response: SearchCloudResponse = await request.json();
      nextPageToken = response.nextPageToken;
      issues = issues.concat(response.issues);
    } while (nextPageToken !== undefined);

    return issues;
  }
}
