/*
 * Copyright 2020 RoadieHQ
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

import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';
import { IssuesCounter, IssueType, Project, Status } from '../types';
import fetch from 'cross-fetch';

export const jiraApiRef = createApiRef<JiraAPI>({
  id: 'plugin.jira.service',
  description: 'Used by the Jira plugin to make requests',
});

const DEFAULT_PROXY_PATH = '/jira/api';
const DEFAULT_REST_API_VERSION = 'latest';
const DONE_STATUS_CATEGORY = 'Done';

type Options = {
  discoveryApi: DiscoveryApi;
  /**
   * Path to use for requests via the proxy, defaults to /jira/api
   */
  proxyPath?: string;
  apiVersion?: number;
};

export class JiraAPI {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;
  private readonly apiVersion: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.proxyPath = options.proxyPath ?? DEFAULT_PROXY_PATH;

    this.apiVersion = options.apiVersion
      ? options.apiVersion.toString()
      : DEFAULT_REST_API_VERSION;
  }

  private generateProjectUrl = (url: string) => new URL(url).origin;

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

  private async getIssuesCountByType({
    apiUrl,
    projectKey,
    component,
    statusesNames,
    issueType,
    issueIcon,
  }: {
    apiUrl: string;
    projectKey: string;
    component: string;
    statusesNames: Array<string>;
    issueType: string;
    issueIcon: string;
  }) {
    const statusesString = this.convertToString(statusesNames);

    const jql = `project = "${projectKey}"
      AND issuetype = "${issueType}"
      ${statusesString ? `AND status in (${statusesString})` : ''}
      ${component ? `AND component = "${component}"` : ''}
      AND statuscategory not in ("Done")
    `;
    const data = {
      jql,
      maxResults: 0,
    };

    const request = await fetch(`${apiUrl}search`, {
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
    statusesNames: Array<string>,
  ) {
    const { apiUrl } = await this.getUrls();

    const request = await fetch(`${apiUrl}project/${projectKey}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!request.ok) {
      throw new Error(
        `failed to fetch data, status ${request.status}: ${request.statusText}`,
      );
    }
    const project = (await request.json()) as Project;

    // Generate counters for each issue type
    const issuesTypes = project.issueTypes.map((status: IssueType) => ({
      name: status.name,
      iconUrl: status.iconUrl,
    }));

    const filteredIssues = issuesTypes.filter(el => el.name !== "Sub-task");

    const issuesCounter = await Promise.all(
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
        });
      }),
    );

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
    };
  }

  async getActivityStream(size: number, projectKey: string) {
    const { baseUrl } = await this.getUrls();

    const request = await fetch(
      `${baseUrl}/activity?maxResults=${size}&streams=key+IS+${projectKey}&os_authType=basic`,
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

    const request = await fetch(`${apiUrl}project/${projectKey}/statuses`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
