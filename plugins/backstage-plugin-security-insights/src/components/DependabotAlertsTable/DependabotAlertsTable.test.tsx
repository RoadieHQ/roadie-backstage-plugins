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

import React from 'react';
import { render } from '@testing-library/react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { securityInsightsPlugin } from '../../plugin';
import {
  entityMock,
  dependabotAlertsResponseMock,
} from '../../mocks/mocks';
import { graphql } from 'msw';
import { msw } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { DependabotAlertsTable } from './DependabotAlertsTable';
import {
  ApiProvider,
  ApiRegistry
} from '@backstage/core-app-api';
import {
  configApiRef,
  githubAuthApiRef
} from '@backstage/core-plugin-api';

const GRAPHQL_GITHUB_API = graphql.link('https://api.github.com/graphql');

const mockGithubAuth = {
  getAccessToken: async (_: string[]) => 'test-token',
};

const config = {
  getOptionalConfigArray: (_: string) => [
    { getOptionalString: (_other: string) => undefined },
  ],
};

const apis = ApiRegistry.from([
  [configApiRef, config],
  [githubAuthApiRef, mockGithubAuth],
]);

const dependabotAlertsQuery = `
  query GetDependabotAlerts($repository: String!, $owner: String!) {
    repository(name: $repo, owner: $owner}) {
      vulnerabilityAlerts(first: 100) {
        totalCount
        nodes {
          createdAt
          id
          dismissedAt
          vulnerableManifestPath
          securityVulnerability {
            vulnerableVersionRange
            package {
              name
            }
            firstPatchedVersion {
              identifier
            }
            severity
            advisory {
              description
            }
          }
        }
      }
    }
`;

describe('dependabot-alerts', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => {
    worker.use(
      GRAPHQL_GITHUB_API.query(dependabotAlertsQuery, (_, res, ctx) =>
          res(ctx.data(dependabotAlertsResponseMock)),
        )
    );
  });
  
  describe('export-plugin', () => {
    it('should export plugin', () => {
      expect(securityInsightsPlugin).toBeDefined();
    });
  });

  describe('GithubDependabotAlertsTable', () => {
    it('displays dependabot alerts in table', async () => {
      worker.use(
        GRAPHQL_GITHUB_API.query(dependabotAlertsQuery, (_, res, ctx) =>
          res(ctx.data(dependabotAlertsResponseMock)),
        ),
      );
    
      const rendered = render(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityMock}>
              <DependabotAlertsTable />
            </EntityProvider>
          </ApiProvider>
      );
      expect(await rendered.findByText('browserslist')).toBeInTheDocument();
      });

  });
});