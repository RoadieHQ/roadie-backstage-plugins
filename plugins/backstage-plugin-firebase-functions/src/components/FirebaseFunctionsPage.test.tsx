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
import { waitForElementToBeRemoved } from '@testing-library/react';
import {
  googleAuthApiRef,
  errorApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import {
  ApiRegistry,
  ApiProvider,
} from '@backstage/core-app-api';
import { firebaseFunctionsApiRef, FirebaseFunctionsClient } from '../api';
import {
  entityMock,
  entityMockMultipleFunctions,
  functionDataMock,
} from '../mocks/mocks';
import { rest } from 'msw';
import { msw, wrapInTestApp, renderWithEffects } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import {Router} from "./Router";
import { EntityProvider } from '@backstage/plugin-catalog-react';

const errorApiMock = { post: jest.fn(), error$: jest.fn() };

const mockGoogleAuth = {
  getAccessToken: async () => 'test-token',
};
const mockConfig = {
  getOptionalConfig: (_3: string) => undefined,
};
const apis = ApiRegistry.from([
  [googleAuthApiRef, mockGoogleAuth],
  [firebaseFunctionsApiRef, new FirebaseFunctionsClient()],
  [errorApiRef, errorApiMock],
  [configApiRef, mockConfig],
]);

describe('FirebaseFunctionsTable', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => {
    jest.resetAllMocks();
    worker.use(
      rest.get('*', (_, res, ctx) =>
        res(ctx.status(200), ctx.json(functionDataMock)),
      ),
    );
  });

  it('should inform about project name not set and not call an api', async () => {
    const rendered = await renderWithEffects(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityMockMultipleFunctions}>
              <Router />
            </EntityProvider>
          </ApiProvider>
    ));
    expect(
      await rendered.findByText('Select projects to fetch data'),
    ).toBeInTheDocument();
  });

  it('should render function details', async () => {
    const rendered = await renderWithEffects(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityMock}>
              <Router />
            </EntityProvider>
          </ApiProvider>
    ));

    // @ts-ignore Typings are broken for the testing-library version used within test-utils.
    await waitForElementToBeRemoved(() => rendered.getByRole('progressbar'));
    expect(await rendered.findByText('helloMarek')).toBeInTheDocument();
  });
});
