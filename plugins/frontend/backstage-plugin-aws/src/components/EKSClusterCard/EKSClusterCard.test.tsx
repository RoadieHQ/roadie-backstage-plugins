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
import { ApiProvider, UrlPatternDiscovery } from '@backstage/core-app-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  MockErrorApi,
  setupRequestMockHandlers,
  TestApiRegistry,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
// eslint-disable-next-line
import { MemoryRouter } from 'react-router-dom';
import { awsApiRef, AwsClient } from '../../api/';
import { ResourceEntity } from '@backstage/catalog-model';
import { EKSClusterCard } from './EKSClusterCard';
import { MockTranslationApi } from '@backstage/test-utils/alpha';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { errorApiRef } from '@backstage/core-plugin-api';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');

const apis = TestApiRegistry.from(
  [awsApiRef, new AwsClient({ discoveryApi })],
  [errorApiRef, new MockErrorApi()],
  [translationApiRef, MockTranslationApi.create()],
);

const entityStub: ResourceEntity = {
  apiVersion: 'backstage.io/v1beta1',
  kind: 'Resource',
  spec: {
    owner: 'unknown',
    type: 'service',
  },
  metadata: {
    annotations: {},
    name: 'cluster1',
  },
};

describe('EKSClusterCard', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => {
    worker.resetHandlers();
    jest.resetAllMocks();
  });

  it('should display the card with the correct annotation error', async () => {
    const rendered = render(
      <MemoryRouter>
        <ApiProvider apis={apis}>
          <EntityProvider entity={entityStub}>
            <EKSClusterCard />
          </EntityProvider>
        </ApiProvider>
      </MemoryRouter>,
    );

    expect(
      await rendered.findByText(/annotation is missing/),
    ).toBeInTheDocument();
    expect(
      await rendered.findByText('amazon.com/eks-cluster-arn'),
    ).toBeInTheDocument();
  });
});
