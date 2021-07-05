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

import React from 'react';
import { render } from '@testing-library/react';
import {
  configApiRef,
  githubAuthApiRef
} from '@backstage/core-plugin-api';
import {
  ApiRegistry,
  ApiProvider
} from '@backstage/core-app-api';
import { rest } from 'msw';
import { msw, wrapInTestApp } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import {
  branchesResponseMock,
  entityMock,
  licenseResponseMock,
} from '../../../mocks/mocks';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import ComplianceCard from '.';
import { EntityProvider } from "@backstage/plugin-catalog-react";

const mockGithubAuth = {
  getAccessToken: async (_: string[]) => 'test-token',
};

const config = {
  getOptionalConfigArray: (_: string) => [
    { getOptionalString: (_2: string) => undefined },
  ],
};

const apis = ApiRegistry.from([
  [githubAuthApiRef, mockGithubAuth],
  [configApiRef, config],
]);

describe('ComplianceCard', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => {
    worker.use(
      rest.get(
        'https://api.github.com/repos/mcalus3/backstage/contents/LICENSE',
        (_, res, ctx) => res(ctx.json(licenseResponseMock))
      ),
      rest.get(
        'https://api.github.com/repos/mcalus3/backstage/branches?protected=true',
        (_, res, ctx) => res(ctx.json(branchesResponseMock))
      )
    );
  });

  it('should display a card with the data from the requests', async () => {
    const rendered = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <ThemeProvider theme={lightTheme}>
            <EntityProvider entity={entityMock}>
              <ComplianceCard />
            </EntityProvider>
          </ThemeProvider>
        </ApiProvider>
      )
    );
    expect(await rendered.findByText('master')).toBeInTheDocument();
    expect(await rendered.findByText('Apache License')).toBeInTheDocument();
  });
});
