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
import { setupServer } from 'msw/node';
import {
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import {
  AnyApiRef,
  configApiRef,
  errorApiRef,
} from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Content } from './HomePageCard';

const entityMock = {
  metadata: {
    namespace: 'default',
    annotations: {},
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: '33f123a4-e83e-4d3f-8baa-631266c5638b',
    etag: 'ZTVmZThhZDctN2VkYi00OTI5LTlkZDMtZTBkNDA4ODg3NDQ4',
    generation: 1,
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
};

const mockErrorApi = {
  post: jest.fn(),
};

const mockConfig = jest.fn().mockImplementation((_: string) => undefined);
const config = {
  getOptionalStringArray: (_: string) => {
    return mockConfig();
  },
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [configApiRef, config],
  [errorApiRef, mockErrorApi],
];

describe('HomePageContent', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  setupRequestMockHandlers(server);
  const props = {
    src: 'https://example.com',
    title: 'some title',
  };

  describe('when src is set', () => {
    it('should render container for the iframe', async () => {
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <Content {...props} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered).toBeTruthy();
    });
  });

  describe('when src is not set', () => {
    it('should not render the iframe', async () => {
      props.src = '';
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <Content {...props} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText(
          'No src field provided. Please pass it in as a prop to populate the iframe.',
        ),
      ).toBeTruthy();
    });
  });

  describe('when src is not in allowlist', () => {
    it('should not render the iframe', async () => {
      props.src = 'https://example.com';
      mockConfig.mockImplementation(() => ['hello.com']);
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <Content {...props} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText(
          'Src https://example.com for Iframe is not included in the allowlist hello.com.',
        ),
      ).toBeTruthy();
    });
  });

  describe('when src is in the allowlist', () => {
    it('should not render the iframe', async () => {
      props.src = 'https://example.com';
      mockConfig.mockImplementation(() => ['example.com']);
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <Content {...props} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered).toBeTruthy();
    });
  });
});
