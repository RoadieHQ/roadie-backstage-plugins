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
import { render, screen } from '@testing-library/react';
import { AnyApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/core-app-api';
import { rest } from 'msw';
import {
  setupRequestMockHandlers,
  wrapInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { entityMock, readmeResponseMock } from '../../../mocks/mocks';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import { ReadMeCard } from '..';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  scmIntegrationsApiRef,
  ScmIntegrationsApi,
} from '@backstage/integration-react';
import { defaultIntegrationsConfig } from '../../../mocks/scmIntegrationsApiMock';

// MarkdownContent uses rect-markdown which throws a type error in the tests so we are mocking it checking the plain text in the components.
jest.mock('@backstage/core-components', ()=>({
  ...jest.requireActual('@backstage/core-components'),
 MarkdownContent:  ({ content }: { content: string }) => <span>{content}</span>,
}))

const mockGithubAuth = {
  getAccessToken: async (_: string[]) => 'test-token',
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [githubAuthApiRef, mockGithubAuth],
  [
    scmIntegrationsApiRef,
    ScmIntegrationsApi.fromConfig(
      ConfigReader.fromConfigs([
        {
          context: 'unit-test',
          data: defaultIntegrationsConfig,
        },
      ]),
    ),
  ],
];

describe('ReadmeCard', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => {
    worker.use(
      rest.get(
        'https://api.github.com/repos/mcalus3/backstage/readme',
        (_, res, ctx) => res(ctx.json(readmeResponseMock)),
      ),
    );
  });

  it('should display a card with the data from the requests', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <ThemeProvider theme={lightTheme}>
            <EntityProvider entity={entityMock}>
              <ReadMeCard />
            </EntityProvider>
          </ThemeProvider>
        </TestApiProvider>,
      ),
    );
    expect(
      await screen.findByText(
        /Backstage unifies all your infrastructure tooling, services, and documentation to create a streamlined development environment from end to end\./,
      ),
    ).toBeInTheDocument();
  });
  it
  ('should display a card with the data from state on second render when response is 304', async () => {
    const { rerender } = render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <ThemeProvider theme={lightTheme}>
            <EntityProvider entity={entityMock}>
              <ReadMeCard />
            </EntityProvider>
          </ThemeProvider>
        </TestApiProvider>,
      ),
    );
    worker.use(
      rest.get(
        'https://api.github.com/repos/mcalus3/backstage/readme',
        (_, res, ctx) => res(ctx.status(304), ctx.json({})),
      ),
    );
    rerender(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <ThemeProvider theme={lightTheme}>
            <EntityProvider entity={entityMock}>
              <ReadMeCard />
            </EntityProvider>
          </ThemeProvider>
        </TestApiProvider>,
      ),
    )
    expect(
      await screen.findByText(
        /Backstage unifies all your infrastructure tooling, services, and documentation to create a streamlined development environment from end to end\./,
      ),
    ).toBeInTheDocument();
  });
  it('should render unicode correctly', async () => {
    const rendered = render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <ThemeProvider theme={lightTheme}>
            <EntityProvider entity={entityMock}>
              <ReadMeCard />
            </EntityProvider>
          </ThemeProvider>
        </TestApiProvider>,
      ),
    );
    expect(
      await rendered.findByText('⭐', { exact: false }),
    ).toBeInTheDocument();
  });
});
