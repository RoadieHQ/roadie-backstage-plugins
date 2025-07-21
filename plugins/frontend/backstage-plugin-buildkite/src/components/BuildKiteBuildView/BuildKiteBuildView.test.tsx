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

import { render } from '@testing-library/react';
import { AnyApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { UrlPatternDiscovery } from '@backstage/core-app-api';
import Router from 'react-router-dom';

import { rest } from 'msw';
import {
  setupRequestMockHandlers,
  TestApiProvider,
  wrapInTestApp,
  MockFetchApi,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import {
  singleBuildResponseMock,
  entityMock,
  buildLogResponseMock,
} from '../../mocks/mocks';
import { buildKiteApiRef } from '../..';
import { BuildkiteApi } from '../../api';
import { rootRouteRef } from '../../plugin';
import BuildkiteBuildView from './BuildKiteBuildView';

const postMock = jest.fn();

const errorApiMock = { post: postMock, error$: jest.fn() };
const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const fetchApi = new MockFetchApi();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const apis: [AnyApiRef, Partial<unknown>][] = [
  [errorApiRef, errorApiMock],
  [buildKiteApiRef, new BuildkiteApi({ discoveryApi, fetchApi })],
];

describe('BuildkiteBuildView', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => jest.resetAllMocks());

  it('should display a page build and job information', async () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ buildNumber: '137' });
    worker.use(
      rest.get(
        'http://exampleapi.com/buildkite/api/organizations/rbnetwork/pipelines/example-pipeline/builds/137',
        (_, res, ctx) => res(ctx.json(singleBuildResponseMock)),
      ),
      rest.get(
        'http://exampleapi.com/buildkite/api/organizations/rbnetwork/pipelines/example-pipeline/builds/137/jobs/bc4ea160-49b9-484c-a8ce-18fddb99429f/log',
        (_, res, ctx) =>
          res(
            ctx.json(
              buildLogResponseMock(
                '137',
                'bc4ea160-49b9-484c-a8ce-18fddb99429f',
                'log content 1',
              ),
            ),
          ),
      ),
      rest.get(
        'http://exampleapi.com/buildkite/api/organizations/rbnetwork/pipelines/example-pipeline/builds/137/jobs/8746b001-62ef-4b78-b337-493ef21be4ee/log',
        (_, res, ctx) =>
          res(
            ctx.json(
              buildLogResponseMock(
                '137',
                '8746b001-62ef-4b78-b337-493ef21be4ee',
                'log content 2',
              ),
            ),
          ),
      ),
      rest.get(
        'http://exampleapi.com/buildkite/api/organizations/rbnetwork/pipelines/example-pipeline/builds/137/jobs/9e6a8982-4da9-4e77-b511-ce2c177ec7ae/log',
        (_, res, ctx) =>
          res(
            ctx.json(
              buildLogResponseMock(
                '137',
                '9e6a8982-4da9-4e77-b511-ce2c177ec7ae',
                'log content 3',
              ),
            ),
          ),
      ),
    );
    const rendered = render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <BuildkiteBuildView entity={entityMock} />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/': rootRouteRef,
          },
        },
      ),
    );

    expect(await rendered.findByText('All builds')).toBeInTheDocument();
    expect(await rendered.findByText('Build details')).toBeInTheDocument();
    expect(
      await rendered.findByText('#137 - Create catalog-info-comp.yaml'),
    ).toBeInTheDocument();
    expect(await rendered.findByText(/Install Yarn/)).toBeInTheDocument();
    expect(await rendered.findByText(/Install Service/)).toBeInTheDocument();
    expect(await rendered.findByTestId('waiter')).toBeInTheDocument();
    expect(await rendered.findByText(/yarn run env/)).toBeInTheDocument();
  });

  it('should display an error if build job has undefined type', async () => {
    const customMock = {
      ...singleBuildResponseMock,
      jobs: [{ id: '1', type: undefined }],
    };
    jest.spyOn(Router, 'useParams').mockReturnValue({ buildNumber: '137' });
    worker.use(
      rest.get(
        'http://exampleapi.com/buildkite/api/organizations/rbnetwork/pipelines/example-pipeline/builds/137',
        (_, res, ctx) => res(ctx.json(customMock)),
      ),
    );
    const rendered = render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <BuildkiteBuildView entity={entityMock} />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/': rootRouteRef,
          },
        },
      ),
    );

    expect(await rendered.findByText('All builds')).toBeInTheDocument();
    expect(await rendered.findByText('Build details')).toBeInTheDocument();
    expect(
      await rendered.findByText('#137 - Create catalog-info-comp.yaml'),
    ).toBeInTheDocument();
    expect(
      await rendered.findByText(/Undefined Build Job Type/),
    ).toBeInTheDocument();
  });
});
