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

import { waitFor } from '@testing-library/react';
import { ConfigReader } from '@backstage/config';
import { AnyApiRef } from '@backstage/core-plugin-api';
import { scmAuthApiRef, ScmAuthApi } from '@backstage/integration-react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { registerMswTestHooks } from '@backstage/test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { GithubPullRequestsClient, githubPullRequestsApiRef } from './api';
import {
  githubPullRequestsApi,
  entityGithubPullRequestsContent,
  entityGithubPullRequestsOverviewCard,
  entityGithubPullRequestsTable,
  entityGithubGroupPullRequestsCard,
} from './alpha';
import {
  entityMock,
  groupEntityMockWithSlug,
  openPullsRequestMock,
} from './mocks/mocks';
import { Entity } from '@backstage/catalog-model';

const configApi = new ConfigReader({});

// Mock scmAuthApi following the pattern from PullRequestsStatsCard.test.tsx
const mockScmAuthApi = {
  getCredentials: async () => ({ token: 'test-token', headers: {} }),
} as ScmAuthApi;

const apis: [AnyApiRef, Partial<unknown>][] = [
  [scmAuthApiRef, mockScmAuthApi],
  [
    githubPullRequestsApiRef,
    new GithubPullRequestsClient({ configApi, scmAuthApi: mockScmAuthApi }),
  ],
];

const renderExtension = (
  extension: Parameters<typeof createExtensionTester>[0],
  entity: Entity = entityMock as Entity,
) =>
  renderInTestApp(
    <TestApiProvider apis={apis}>
      <EntityProvider entity={entity}>
        {createExtensionTester(extension).reactElement()}
      </EntityProvider>
    </TestApiProvider>,
  );

describe('GitHub Pull Requests alpha extensions', () => {
  const worker = setupServer();
  registerMswTestHooks(worker);

  beforeEach(() => {
    jest.resetAllMocks();
    worker.use(
      // Mock GitHub API calls
      rest.get('https://api.github.com/search/issues', (_, res, ctx) =>
        res(ctx.json(openPullsRequestMock)),
      ),
      // Mock the SCM auth refresh endpoint to avoid warnings
      rest.get('http://localhost:7007/api/auth/github/refresh', (_, res, ctx) =>
        res(ctx.json({ token: 'mock-token' })),
      ),
    );
  });

  describe('entityGithubPullRequestsContent', () => {
    it('renders the pull requests content page', async () => {
      const rendered = await renderExtension(entityGithubPullRequestsContent);

      await waitFor(
        () => {
          expect(
            rendered.getByText('GitHub Pull Requests'),
          ).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });

    it('shows missing annotation when entity lacks github.com/project-slug', async () => {
      const entityWithoutAnnotation: Entity = {
        ...entityMock,
        metadata: {
          ...entityMock.metadata,
          annotations: {},
        },
      } as Entity;

      const rendered = await renderExtension(
        entityGithubPullRequestsContent,
        entityWithoutAnnotation,
      );

      await waitFor(
        () => {
          expect(rendered.getByText(/Missing Annotation/)).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });
  });

  describe('entityGithubPullRequestsOverviewCard', () => {
    it('renders the overview card with PR statistics', async () => {
      const rendered = await renderExtension(
        entityGithubPullRequestsOverviewCard,
      );

      // Wait for the card to load - check for the title
      await waitFor(
        () => {
          expect(
            rendered.getByText('GitHub Pull Requests Statistics'),
          ).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });
  });

  describe('entityGithubPullRequestsTable', () => {
    it('renders the pull requests table with column headers', async () => {
      const rendered = await renderExtension(entityGithubPullRequestsTable);

      // The PullRequestsTable component renders a Material-UI Table with specific columns
      // Based on PullRequestsTable.test.tsx, it should have these column headers
      await waitFor(
        () => {
          expect(rendered.getByText('Title')).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Verify other key column headers are present
      expect(rendered.getByText('Creator')).toBeInTheDocument();
      expect(rendered.getByText('Created')).toBeInTheDocument();
    });
  });

  describe('entityGithubGroupPullRequestsCard', () => {
    it('renders the group pull requests card when team-slug annotation is present', async () => {
      const rendered = await renderExtension(
        entityGithubGroupPullRequestsCard,
        groupEntityMockWithSlug as Entity,
      );

      // The component should render successfully without showing the missing annotation error
      // Based on Content.test.tsx, when team-slug is present, it renders the PullRequestsListView
      await waitFor(
        () => {
          // Verify that Missing Annotation is NOT displayed (i.e., auth wrapper loaded)
          expect(
            rendered.queryByText('Missing Annotation'),
          ).not.toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });

    it('shows missing annotation message when team-slug annotation is missing', async () => {
      const entityWithoutTeamSlug: Entity = {
        ...entityMock,
        metadata: {
          ...entityMock.metadata,
          annotations: {
            'backstage.io/managed-by-location':
              'url:https://github.com/mcalus3/sample-service/blob/master/backstage4.yaml',
            'github.com/project-slug': 'test/repo',
          },
        },
      } as Entity;

      const { getByText } = await renderExtension(
        entityGithubGroupPullRequestsCard,
        entityWithoutTeamSlug,
      );

      // The card should render a missing annotation message for github.com/team-slug
      // Based on Content.test.tsx line 130-134
      await waitFor(
        () => {
          expect(getByText('Missing Annotation')).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });
  });

  describe('githubPullRequestsApi', () => {
    it('provides the GitHub Pull Requests API', () => {
      // The API blueprint should be defined
      expect(githubPullRequestsApi).toBeDefined();
      expect(githubPullRequestsApi).toHaveProperty('kind');
    });
  });
});
