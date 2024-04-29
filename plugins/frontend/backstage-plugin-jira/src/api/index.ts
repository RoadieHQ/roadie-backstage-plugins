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
  IssueCountResult,
  IssueCountSearchParams,
  IssuesCounter,
  IssueType,
  Project,
  Status,
  Ticket,
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

  private async pagedIssueCountRequest(
    apiUrl: string,
    jql: string,
    startAt: number,
  ): Promise<IssueCountResult> {
    const data = {
      jql,
      maxResults: -1,
      fields: [
        'key',
        'issuetype',
        'summary',
        'status',
        'assignee',
        'priority',
        'created',
        'updated',
      ],
      startAt,
    };

    const request = await this.fetchApi.fetch(`${apiUrl}search`, {
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
    const response: IssueCountSearchParams = await request.json();
    const lastElement = response.startAt + response.maxResults;

    return {
      issues: response.issues,
      next: response.total > lastElement ? lastElement : undefined,
    };
  }

  private async getIssueCountPaged({
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
      ${label ? `AND labels in ("${label}")` : ''}
      AND statuscategory not in ("Done") 
    `;

    let startAt: number | undefined = 0;
    const issues: Ticket[] = [];

    while (startAt !== undefined) {
      const res: IssueCountResult = await this.pagedIssueCountRequest(
        apiUrl,
        jql,
        startAt,
      );
      startAt = res.next;
      issues.push(...res.issues);
    }

    return issues;
  }

  private async getIssuesCountByType({
    apiUrl,
    projectKey,
    component,
    statusesNames,
    issueType,
    issueIcon,
    label,
  }: {
    apiUrl: string;
    projectKey: string;
    component: string;
    statusesNames: Array<string>;
    issueType: string;
    issueIcon: string;
    label: string;
  }) {
    const statusesString = this.convertToString(statusesNames);

    const jql = `project = "${projectKey}"
      AND issuetype = "${issueType}"
      ${statusesString ? `AND status in (${statusesString})` : ''}
      ${component ? `AND component = "${component}"` : ''}
      AND statuscategory not in ("Done") ${
        label ? `AND labels in ("${label}")` : ''
      }
    `;
    const data = {
      jql,
      maxResults: 0,
    };
    const request = await this.fetchApi.fetch(`${apiUrl}search`, {
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
    const response = await request.json();
    return {
      total: response.total,
      name: issueType,
      iconUrl: issueIcon,
    } as IssuesCounter;
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

    // If component not defined, execute the same code. Otherwise use paged request
    // to fetch also the issue-keys of all the tasks for that component.
    let issuesCounter: IssuesCounter[] = [];
    let ticketIds: string[] = [];
    let tickets: Ticket[] = [];
    const foundIssues = await this.getIssueCountPaged({
      apiUrl,
      projectKey,
      component,
      label,
      statusesNames,
    });
    if (!component && !label) {
      // Generate counters for each issue type
      const issuesTypes = project.issueTypes.map((status: IssueType) => ({
        name: status.name,
        iconUrl: status.iconUrl,
      }));

      const filteredIssues = issuesTypes.filter(el => el.name !== 'Sub-task');

      issuesCounter = await Promise.all(
        filteredIssues.map(issue => {
          const issueType = issue.name;
          const issueIcon = issue.iconUrl;
          return this.getIssuesCountByType({
            apiUrl,
            projectKey,
            component,
            statusesNames,
            issueType,
            issueIcon,
            label,
          });
        }),
      );
    } else {
      // Get all issues, count them using reduce and generate a ticketIds array,
      // used to filter in the activity stream
      const issuesTypes = project.issueTypes.map(
        (status: IssueType): IssuesCounter => ({
          name: status.name,
          iconUrl: status.iconUrl,
          total: 0,
        }),
      );
      issuesCounter = foundIssues
        .reduce((prev, curr) => {
          const name = curr.fields?.issuetype.name;
          const idx = issuesTypes.findIndex(i => i.name === name);
          if (idx !== -1) {
            issuesTypes[idx].total++;
          }
          return prev;
        }, issuesTypes)
        .filter(el => el.name !== 'Sub-task');

      ticketIds = foundIssues.map(i => i.key);
    }
    tickets = foundIssues.map(index => {
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
      issues:
        issuesCounter && issuesCounter.length
          ? issuesCounter.map(status => ({
              ...status,
            }))
          : [],
      ticketIds: ticketIds,
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
          .map(it => it.name)
          .reduce((acc, val) => {
            acc.push(val);
            return acc;
          }, [] as string[]),
      ),
    ];
  }
}
