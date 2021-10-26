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
  errorApiRef,
  identityApiRef
} from '@backstage/core-plugin-api';
import {
  ApiRegistry,
  ApiProvider
} from '@backstage/core-app-api';
import { rest } from 'msw';
import { msw } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { setupServer } from 'msw/node';
import {
  credentialsResponseMock,
  entityMock,
  lambdaResponseMock,
} from '../../mocks/mocks';
import { awsLambdaApiRef, AWSLambdaOverviewWidget } from '../..';
import { AwsLambdaClient } from '../../api';

const errorApiMock = { post: jest.fn(), error$: jest.fn() };
const identityApiMock = { getIdToken: jest.fn(), error$: jest.fn() };

const config = {
  getString: (_: string) => 'https://test-url',
};

const apis = ApiRegistry.from([
  [errorApiRef, errorApiMock],
  [configApiRef, config],
  [awsLambdaApiRef, new AwsLambdaClient()],
  [identityApiRef, identityApiMock]
]);

describe('AWSLambdaCard', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => {
    worker.use(
      rest.get('https://test-url/api/aws/credentials', (_, res, ctx) =>
        res(ctx.json(credentialsResponseMock))
      ),
      rest.get(
        'https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/openfraksl-dev-graphql',
        (_, res, ctx) => res(ctx.json(lambdaResponseMock))
      )
    );
  });

  it('should display an ovreview card with the data from the requests', async () => {
    const rendered = render(
      <ApiProvider apis={apis}>
        <EntityProvider entity={entityMock}>
          <AWSLambdaOverviewWidget />
        </EntityProvider>
      </ApiProvider>
    );
    expect(
      await rendered.findByText(lambdaResponseMock.Configuration.FunctionName)
    ).toBeInTheDocument();
    expect(
      await rendered.findByText(lambdaResponseMock.Configuration.State)
    ).toBeInTheDocument();
    expect(
      await rendered.findByText(
        lambdaResponseMock.Configuration.LastUpdateStatus
      )
    ).toBeInTheDocument();
  });
});
