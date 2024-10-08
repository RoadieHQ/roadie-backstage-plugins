/*
 * Copyright 2024 Larder Software Limited
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
import { WizAPI } from './WizAPI';
import { DiscoveryApi } from '@backstage/core-plugin-api';

const DEFAULT_PROXY_PATH = '/wiz/api';

export type Options = {
  discoveryApi: DiscoveryApi;
  proxyPath?: string;
};

export class WizClient implements WizAPI {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.proxyPath = options.proxyPath ?? DEFAULT_PROXY_PATH;
  }

  private async getApiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return proxyUrl + this.proxyPath;
  }

  async fetchProjects(): Promise<any[]> {
    const query =
      'query ProjectsTable($filterBy: ProjectFilters $first: Int, $after: String $orderBy: ProjectOrder) {   projects(filterBy: $filterBy first: $first, after: $after, orderBy: $orderBy) {     nodes {       id       name       isFolder       archived       businessUnit       description     }}}';

    const options = {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables: { first: 5, filterBy: { includeArchived: false } },
      }),
    };
    const response = await fetch(`${await this.getApiUrl()}`, options);

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.errors[0]);
    }

    return payload;
  }

  async fetchIssues(): Promise<any[]> {
    const query =
      'query IssuesTable($filterBy: IssueFilters, $first: Int, $after: String, $orderBy: IssueOrder) { issues:issuesV2(filterBy: $filterBy, first: $first, after: $after, orderBy: $orderBy) { nodes { id sourceRule{ __typename ... on Control { id name controlDescription: description resolutionRecommendation securitySubCategories { title category { name framework { name } } } risks } ... on CloudEventRule{ id name cloudEventRuleDescription: description sourceType type risks } ... on CloudConfigurationRule{ id name cloudConfigurationRuleDescription: description remediationInstructions serviceType risks } } createdAt updatedAt dueAt type resolvedAt statusChangedAt projects { id name slug businessUnit riskProfile { businessImpact } } status severity entitySnapshot { id type nativeType name status cloudPlatform cloudProviderURL providerId region resourceGroupExternalId subscriptionExternalId subscriptionName subscriptionTags tags createdAt externalId } serviceTickets { externalId name url } notes { createdAt updatedAt text user { name email } serviceAccount { name } } } pageInfo { hasNextPage endCursor } } }';

    const options = {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables: { first: 50 },
      }),
    };
    const response = await fetch(`${await this.getApiUrl()}`, options);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error('There was an error');
    }
    return payload.data.issues.nodes;
  }

  async fetchIssuesForProject(projectId: string): Promise<any> {
    const query =
      'query IssuesTable($filterBy: IssueFilters, $first: Int, $after: String, $orderBy: IssueOrder) { issues:issuesV2(filterBy: $filterBy, first: $first, after: $after, orderBy: $orderBy) { nodes { id sourceRule{ __typename ... on Control { id name controlDescription: description resolutionRecommendation securitySubCategories { title category { name framework { name } } } risks } ... on CloudEventRule{ id name cloudEventRuleDescription: description sourceType type risks } ... on CloudConfigurationRule{ id name cloudConfigurationRuleDescription: description remediationInstructions serviceType risks } } createdAt updatedAt dueAt type resolvedAt statusChangedAt projects { id name slug businessUnit riskProfile { businessImpact } } status severity entitySnapshot { id type nativeType name status cloudPlatform cloudProviderURL providerId region resourceGroupExternalId subscriptionExternalId subscriptionName subscriptionTags tags createdAt externalId } serviceTickets { externalId name url } notes { createdAt updatedAt text user { name email } serviceAccount { name } } } pageInfo { hasNextPage endCursor } } }';

    const options = {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables: {
          first: 100,
          filterBy: {
            project: [`${projectId}`],
          },
          orderBy: { direction: 'DESC', field: 'SEVERITY' },
        },
      }),
    };
    const response = await fetch(`${await this.getApiUrl()}`, options);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        'There was an error retrieving issues for specific project',
      );
    }
    return payload.data.issues.nodes;
  }
}
