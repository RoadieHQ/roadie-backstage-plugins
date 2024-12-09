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
import fetch from 'node-fetch';
import { Config } from '@backstage/config';

export class WizClient {
  private clientId: string;
  private clientSecret: string;
  private tokenUrl: string;
  private wizAPIUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(config: Config) {
    this.clientId = config.getOptionalString('wiz.clientId') ?? 'clientId';
    this.clientSecret =
      config.getOptionalString('wiz.clientSecret') ?? 'clientSecret';
    this.tokenUrl = config.getOptionalString('wiz.tokenUrl') ?? 'tokenUrl';
    this.wizAPIUrl = config.getOptionalString('wiz.wizAPIUrl') ?? 'wizAPIUrl';
  }

  async fetchAccessToken() {
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('audience', 'wiz-api');

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`${response.status}:${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('Refresh token not available');
    }

    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('refresh_token', this.refreshToken);
    params.append('grant_type', 'client_credentials');
    params.append('audience', 'wiz-api');

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
  }

  async ensureValidToken() {
    if (
      !this.accessToken ||
      (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt)
    ) {
      await this.refreshAccessToken();
    }
  }

  async getIssuesForProject(projectId: string) {
    try {
      await this.ensureValidToken();

      const query = `
    query IssuesTable($filterBy: IssueFilters, $first: Int, $after: String, $orderBy: IssueOrder) {
      issues: issuesV2(filterBy: $filterBy, first: $first, after: $after, orderBy: $orderBy) {
        nodes {
          id
          sourceRule {
            __typename
            ... on Control {
              id
              name
              controlDescription: description
              securitySubCategories {
                title
                category {
                  name
                  framework {
                    name
                  }
                }
              }
              risks
            }
          }
          createdAt
          updatedAt
          type
          resolvedAt
          status
          severity
          entitySnapshot {
            id
            type
            name
            status
            createdAt
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            first: 500,
            filterBy: {
              project: [projectId],
            },
            orderBy: { direction: 'DESC', field: 'SEVERITY' },
          },
        }),
      };

      const response = await fetch(this.wizAPIUrl, options);

      if (!response.ok) {
        const errorMessage = `${response.status} ${response.statusText}`;
        const errorBody = await response.json().catch(() => null);

        throw new Error(
          errorBody?.errors[0].message
            ? `${errorBody.errors[0].message}`
            : errorMessage,
        );
      }
      return response.json();
    } catch (error: any) {
      throw new Error(
        error.message || 'An error occurred while fetching project issues.',
      );
    }
  }
}
