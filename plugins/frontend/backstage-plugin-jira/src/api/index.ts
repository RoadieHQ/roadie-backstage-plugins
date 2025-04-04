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

import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import {
  IssuesResult,
  IssuesResponse,
  IssuesCounter,
  IssueType,
  Project,
  Status,
  Ticket,
  UserSummary,
  User,
  TicketSummary,
} from '../types';

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
};

export class JiraAPI {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;
  private readonly apiVersion: string;
  private readonly confluenceActivityFilter: string | undefined;
  private readonly fetchApi: FetchApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;

    const proxyPath = options.configApi.getOptionalString('jira.proxyPath');
    this.proxyPath = proxyPath ?? DEFAULT_PROXY_PATH;

    const apiVersion = options.configApi.getOptionalNumber('jira.apiVersion');
    this.apiVersion = apiVersion
      ? apiVersion.toString()
      : DEFAULT_REST_API_VERSION;

    this.confluenceActivityFilter = options.configApi.getOptionalString(
      'jira.confluenceActivityFilter',
    );

    this.fetchApi = options.fetchApi;
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

  private async pagedIssuesRequest(
    apiUrl: string,
    jql: string,
    nextPageToken?: string,
    maxResults?: number,
  ): Promise<IssuesResult> {
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
    const request = await this.fetchApi.fetch(`${apiUrl}search/jql`, {
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
    const response: IssuesResponse = await request.json();

    return {
      issues: response.issues,
      nextPageToken: response.nextPageToken,
    };
  }

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

    let nextPageToken: string | undefined;
    const issues: Ticket[] = [];

    do {
      const res: IssuesResult = await this.pagedIssuesRequest(
        apiUrl,
        jql,
        nextPageToken,
      );
      nextPageToken = res.nextPageToken;
      issues.push(...res.issues);
    } while (nextPageToken !== undefined);

    return issues;
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

  async getUserDetails(userId: string) {
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

    let tickets: TicketSummary[] = [];

    const jql = `assignee = "${userId}" AND statusCategory in ("To Do", "In Progress")`;

    let nextPageToken: string | undefined;
    const foundIssues: Ticket[] = [];

    do {
      const res: IssuesResult = await this.pagedIssuesRequest(
        apiUrl,
        jql,
        nextPageToken,
      );
      nextPageToken = res.nextPageToken;
      foundIssues.push(...res.issues);
    } while (nextPageToken !== undefined);

    tickets = foundIssues.map(index => {
      return {
        key: index.key,
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
      };
    });

    return {
      user: {
        name: user.displayName,
        avatarUrl: user.avatarUrls['48x48'],
        url: this.getDomainFromApiUrl(user.self),
      } as UserSummary,
      tickets,
    };
  }

  async jqlQuery(query: string, maxResults?: number) {
    const { apiUrl } = await this.getUrls();

    const issues = [];

    let nextPageToken: string | undefined;
    do {
      const res: IssuesResult = await this.pagedIssuesRequest(
        apiUrl,
        query,
        nextPageToken,
        maxResults,
      );
      nextPageToken = res.nextPageToken;
      issues.push(...res.issues);
    } while (nextPageToken !== undefined);

    return issues;
  }
}
