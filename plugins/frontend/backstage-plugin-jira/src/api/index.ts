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

import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  ErrorApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { DateTime } from 'luxon';
import {
  Status,
  TicketSummary,
  User,
  UserSummary,
  PullRequest,
  IssuesCounter,
  IssueType,
  Project,
} from '../types';
import { JiraProductStrategy } from './strategies/base';
import { JiraProductStrategyFactory } from './strategies';

export const jiraApiRef = createApiRef<JiraAPI>({
  id: 'plugin.jira.service',
});

const DEFAULT_PROXY_PATH = '/jira/api';
const DEFAULT_REST_API_VERSION = 'latest';
const DONE_STATUS_CATEGORY = 'Done';

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  fetchApi: FetchApi;
  errorApi?: ErrorApi;
};

export class JiraAPI {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;
  private readonly apiVersion: string;
  private readonly strategy: JiraProductStrategy;
  private readonly confluenceActivityFilter: string | undefined;
  private readonly fetchApi: FetchApi;
  private readonly errorApi?: ErrorApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;

    const proxyPath = options.configApi.getOptionalString('jira.proxyPath');
    this.proxyPath = proxyPath ?? DEFAULT_PROXY_PATH;

    const apiVersion = options.configApi.getOptionalNumber('jira.apiVersion');
    this.apiVersion = apiVersion
      ? apiVersion.toString()
      : DEFAULT_REST_API_VERSION;

    const product =
      options.configApi.getOptionalString('jira.product') ?? 'cloud';
    this.strategy = JiraProductStrategyFactory.createStrategy(product, options);

    this.confluenceActivityFilter = options.configApi.getOptionalString(
      'jira.confluenceActivityFilter',
    );

    this.fetchApi = options.fetchApi;
    this.errorApi = options.errorApi;
  }

  // Helper method to log errors in a consistent way
  private logError(message: string, error: Error): void {
    // Use errorApi if available, otherwise errors are silently handled
    if (this.errorApi) {
      this.errorApi.post(new Error(`${message}: ${error.message}`));
    }
  }

  private getDomainFromApiUrl(apiUrl: string): string {
    const url = new URL(apiUrl);
    return url.origin;
  }

  private generateProjectUrl = (url: string) =>
    new URL(url).origin +
    new URL(url).pathname.replace(/\/rest\/api\/.*$/g, '');

  private async getUrls() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return {
      apiUrl: `${proxyUrl}${this.proxyPath}/rest/api/${this.apiVersion}/`,
      baseUrl: `${proxyUrl}${this.proxyPath}`,
    };
  }

  private convertToString = (arrayElement: Array<string>): string =>
    arrayElement
      .filter(Boolean)
      .map(i => `'${i}'`)
      .join(',');

  private async getIssuesPaged({
    apiUrl,
    projectKey,
    component,
    label,
    statusesNames,
  }: {
    apiUrl: string;
    projectKey: string;
    component: string;
    label: string;
    statusesNames: Array<string>;
  }) {
    const statusesString = this.convertToString(statusesNames);

    const jql = `project = "${projectKey}"
      ${statusesString ? `AND status in (${statusesString})` : ''}
      ${component ? `AND component = "${component}"` : ''}
      ${label ? `AND labels in (${label})` : ''}
      AND statuscategory not in ("Done") 
    `;

    return this.strategy.pagedIssuesRequest(apiUrl, jql);
  }

  async getProjectDetails(
    projectKey: string,
    component: string,
    label: string,
    statusesNames: Array<string>,
  ) {
    const { apiUrl } = await this.getUrls();

    const request = await this.fetchApi.fetch(
      `${apiUrl}project/${projectKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`,
      );
    }
    const project = (await request.json()) as Project;

    const foundIssues = await this.getIssuesPaged({
      apiUrl,
      projectKey,
      component,
      label,
      statusesNames,
    });

    const issuesCounter: IssuesCounter[] = project.issueTypes
      .filter(issueType => issueType.name !== 'Sub-task')
      .map(
        (issueType: IssueType): IssuesCounter => ({
          name: issueType.name,
          iconUrl: issueType.iconUrl,
          total: foundIssues.filter(
            issue => issue.fields?.issuetype.name === issueType.name,
          ).length,
        }),
      );

    const ticketIds: string[] = foundIssues.map(issue => issue.key);

    const tickets = foundIssues.map(index => {
      return {
        key: index.key,
        summary: index?.fields?.summary,
        assignee: {
          displayName: index?.fields?.assignee?.displayName,
          avatarUrl: index?.fields?.assignee?.avatarUrls['48x48'],
        },
        status: index?.fields?.status?.name,
        priority: index?.fields?.priority,
        created: index?.fields?.created,
        updated: index?.fields?.updated,
      };
    });
    return {
      project: {
        name: project.name,
        iconUrl: project.avatarUrls['48x48'],
        type: project.projectTypeKey,
        url: this.generateProjectUrl(project.self),
      },
      issues: issuesCounter,
      ticketIds,
      tickets,
    };
  }

  async getActivityStream(
    size: number,
    projectKey: string,
    componentName: string | undefined,
    ticketIds: string[] | undefined,
    label: string | undefined,
    isBearerAuth: boolean,
  ) {
    const { baseUrl } = await this.getUrls();

    let filterUrl = `streams=key+IS+${projectKey}`;
    if (ticketIds && (componentName || label)) {
      filterUrl += `&streams=issue-key+IS+${ticketIds.join('+')}`;
      filterUrl += this.confluenceActivityFilter
        ? `&${this.confluenceActivityFilter}=activity+IS+NOT+*`
        : '';
      // Filter to remove all the changes done in Confluence, otherwise they are also shown as part of the component's activity stream
    }

    const request = await this.fetchApi.fetch(
      isBearerAuth
        ? `${baseUrl}/activity?maxResults=${size}&${filterUrl}`
        : `${baseUrl}/activity?maxResults=${size}&${filterUrl}&os_authType=basic`,
      {},
    );
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`,
      );
    }
    const activityStream = await request.text();

    return activityStream;
  }

  async getStatuses(projectKey: string) {
    const { apiUrl } = await this.getUrls();

    const request = await this.fetchApi.fetch(
      `${apiUrl}project/${projectKey}/statuses`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`,
      );
    }
    const statuses = (await request.json()) as Array<Status>;

    return [
      ...new Set(
        statuses
          .flatMap(status => status.statuses)
          .filter(
            status => status.statusCategory?.name !== DONE_STATUS_CATEGORY,
          )
          .map(it => it.name),
      ),
    ];
  }

  // Fetch detailed issue information including changelog and comments
  async getIssueDetails(issueKey: string) {
    const { apiUrl } = await this.getUrls();

    const request = await this.fetchApi.fetch(
      `${apiUrl}issue/${issueKey}?expand=changelog`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!request.ok) {
      throw new Error(
        `Failed to fetch issue details, status ${request.status}: ${request.statusText}`,
      );
    }

    return await request.json();
  }

  // Fetch pull request information linked to a Jira issue
  async getLinkedPullRequests(issueId: string) {
    const { baseUrl } = await this.getUrls();

    try {
      const request = await this.fetchApi.fetch(
        `${baseUrl}/rest/dev-status/1.0/issue/detail?issueId=${issueId}&applicationType=stash&dataType=pullrequest`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!request.ok) {
        throw new Error(
          `Failed to fetch linked PRs, status ${request.status}: ${request.statusText}`,
        );
      }

      const response = await request.json();
      return response.detail?.[0]?.pullRequests || [];
    } catch (error) {
      this.logError(`Error fetching linked PRs for ${issueId}`, error as Error);
      return [];
    }
  }

  async getUserDetails(userId: string, fetchLinkedPRs: boolean) {
    const { apiUrl } = await this.getUrls();

    const request = await this.fetchApi.fetch(
      `${apiUrl}user?username=${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`,
      );
    }
    const user = (await request.json()) as User;

    const jql = `assignee = "${userId}" AND statusCategory in ("To Do", "In Progress") ORDER BY updated desc`;

    const foundIssues = await this.strategy.pagedIssuesRequest(apiUrl, jql);

    // Process all tickets in parallel to improve loading time
    const enhancedTickets: TicketSummary[] = await Promise.all(
      foundIssues.map(async index => {
        let lastComment = '';
        let assignedDate = '';
        let assignedRelativeTime = '';
        let linkedPullRequests: PullRequest[] = [];

        // Try to fetch detailed information including comments and changelog
        try {
          const details = await this.getIssueDetails(index.key);

          // Get the latest comment if available
          if (details.fields?.comment?.comments?.length > 0) {
            const comments = details.fields.comment.comments;
            lastComment = comments[comments.length - 1].body;
          }

          // Get the assignment date from changelog if available
          if (details.changelog?.histories?.length > 0) {
            const assignmentHistory = details.changelog.histories
              .filter((h: { items: any[] }) =>
                h.items.some(
                  (i: { field: string; to: string }) =>
                    i.field === 'assignee' && i.to === userId,
                ),
              )
              .sort(
                (a: { created: string }, b: { created: string }) =>
                  new Date(b.created).getTime() - new Date(a.created).getTime(),
              );

            if (assignmentHistory.length > 0) {
              // Store the exact date for tooltip display
              assignedDate = new Date(
                assignmentHistory[0].created,
              ).toLocaleDateString();

              // Add relative time format using Luxon
              assignedRelativeTime =
                DateTime.fromISO(assignmentHistory[0].created).toRelative() ||
                '';
            }
          }

          // Get linked pull requests if issue ID is available and fetchLinkedPRs is enabled
          if (index.id && fetchLinkedPRs) {
            try {
              const prs = await this.getLinkedPullRequests(index.id);
              linkedPullRequests = prs.map((pr: any) => ({
                id: pr.id,
                name: pr.name,
                url: pr.url,
                status: pr.status,
                lastUpdate: pr.lastUpdate,
                author: pr.author
                  ? {
                      name: pr.author.name,
                      avatar: pr.author.avatar,
                    }
                  : undefined,
              }));
            } catch (prError) {
              // Continue silently as this is a non-critical error that shouldn't block ticket display
              this.logError(
                `Error fetching PRs for ${index.key}`,
                prError as Error,
              );
            }
          }
        } catch (error) {
          // Silently continue if we can't get detailed info for a ticket
          // Non-critical error that shouldn't block overall functionality
          this.logError(
            `Error fetching details for ${index.key}`,
            error as Error,
          );
        }

        return {
          key: index.key,
          id: index.id,
          parent: index?.fields?.parent?.key,
          summary: index?.fields?.summary,
          assignee: {
            displayName: index?.fields?.assignee?.displayName,
            avatarUrl: index?.fields?.assignee?.avatarUrls['48x48'],
          },
          status: index?.fields?.status,
          issuetype: index?.fields?.issuetype,
          priority: index?.fields?.priority,
          created: index?.fields?.created,
          updated: index?.fields?.updated,
          lastComment,
          assignedDate,
          assignedRelativeTime,
          linkedPullRequests,
        };
      }),
    );

    return {
      user: {
        name: user.displayName,
        avatarUrl: user.avatarUrls['48x48'],
        url: this.getDomainFromApiUrl(user.self),
      } as UserSummary,
      tickets: enhancedTickets,
    };
  }

  async jqlQuery(query: string, maxResults?: number) {
    const { apiUrl } = await this.getUrls();

    return this.strategy.pagedIssuesRequest(apiUrl, query, maxResults);
  }
}
