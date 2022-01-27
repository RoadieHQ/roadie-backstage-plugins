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
import { Entity } from '@backstage/catalog-model';
import { render } from '@testing-library/react';
import { entityStub, dependabotAlertsResponseMock } from '../../mocks/mocks';
import { graphql } from 'msw';
import {
  setupRequestMockHandlers,
  wrapInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { DependabotAlertsTable } from './DependabotAlertsTable';
import {
  configApiRef,
  githubAuthApiRef,
  AnyApiRef,
} from '@backstage/core-plugin-api';
import { securityInsightsPlugin } from '../../plugin';

let entity: { entity: Entity };

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => {
    return entity;
  },
}));

jest.mock('@octokit/graphql', () => ({
  graphql: {
    defaults: () => {
      const gqlEndpoint = (_query: string, _params: object) => {
        return new Promise(resolve => {
          resolve(dependabotAlertsResponseMock);
        });
      };
      return gqlEndpoint;
    },
  },
}));

const GRAPHQL_GITHUB_API = graphql.link('https://api.github.com/graphql');

const mockGithubAuth = {
  getAccessToken: async (_: string[]) => 'test-token',
};

const config = {
  getOptionalConfigArray: (_: string) => [
    { getOptionalString: (_other: string) => undefined },
  ],
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [configApiRef, config],
  [githubAuthApiRef, mockGithubAuth],
];

describe('Dependabot alerts overview', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => {
    worker.resetHandlers();
    jest.resetAllMocks();
  });

  describe('export-security-insights-plugin', () => {
    it('should export plugin', () => {
      expect(securityInsightsPlugin).toBeDefined();
    });
  });

  describe('GithubDependabotAlertsTable', () => {
    beforeEach(() => {
      entity = entityStub;
    });

    it('check if mocked data is shown in the dependabot alerts table', async () => {
      worker.use(
        GRAPHQL_GITHUB_API.query('GetDependabotAlerts', (_, res, ctx) => {
          res(ctx.data(dependabotAlertsResponseMock));
        }),
      );

      const rendered = render(
        wrapInTestApp(
          <TestApiProvider apis={apis}>
            <DependabotAlertsTable />
          </TestApiProvider>,
        ),
      );
      expect(
        await rendered.findByText('serialize-javascript'),
      ).toBeInTheDocument();
    });
  });
});
