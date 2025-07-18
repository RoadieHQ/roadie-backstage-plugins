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
import { IFrameCard } from './IFrameComponent';
import { IFrameComponentProps } from './types';

const entityMock = {
  metadata: {
    namespace: 'default',
    annotations: {
      iframeSrc: 'https://example-annotation.com',
    },
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

describe('IFrameCard', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  setupRequestMockHandlers(server);
  const props: IFrameComponentProps = {
    src: 'https://example.com',
    title: 'some title',
  };

  describe('when src is set', () => {
    it('should render container for the iframe', async () => {
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <IFrameCard {...props} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('some title')).toBeTruthy();
    });
  });

  describe('when src is not set', () => {
    it('should not render the iframe', async () => {
      props.src = '';
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <IFrameCard {...props} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText(
          'You must provide `src` or `srcFromAnnotation`',
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
            <IFrameCard {...props} />
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
    it('should render the iframe', async () => {
      props.src = 'https://example.com';
      mockConfig.mockImplementation(() => ['example.com']);
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <IFrameCard {...props} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('some title')).toBeTruthy();
    });
  });

  describe('when srcFromAnnotation is in the allowlist', () => {
    it('should render the iframe', async () => {
      mockConfig.mockImplementation(() => ['example-annotation.com']);
      const srcFromAnnotationProps = {
        srcFromAnnotation: 'iframeSrc',
        title: 'some title',
      };
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <IFrameCard {...srcFromAnnotationProps} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('some title')).toBeTruthy();
    });
  });

  describe('when srcFromAnnotation is not in the entity', () => {
    it('should not render the iframe', async () => {
      const srcFromAnnotationProps = {
        srcFromAnnotation: 'notSet',
        title: 'some title',
      };
      mockConfig.mockImplementation(() => ['hello.com']);
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <IFrameCard {...srcFromAnnotationProps} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText(
          'Failed to get url src from the entity annotation notSet',
        ),
      ).toBeTruthy();
    });
  });

  describe('when srcFromAnnotation is not in allowlist', () => {
    it('should not render the iframe', async () => {
      const srcFromAnnotationProps = {
        srcFromAnnotation: 'iframeSrc',
        title: 'some title',
      };
      mockConfig.mockImplementation(() => ['hello.com']);
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <IFrameCard {...srcFromAnnotationProps} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText(
          'Src https://example-annotation.com for Iframe is not included in the allowlist hello.com.',
        ),
      ).toBeTruthy();
    });
  });

  describe('when src attempts to use the javascript protocol', () => {
    it('should not render the iframe', async () => {
      // eslint-disable-next-line no-script-url
      props.src = "javascript:alert('JavaScript Link!');";
      mockConfig.mockImplementation(() => ['hello.com']);
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <IFrameCard {...props} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText(
          "Src 'javascript:alert('JavaScript Link!');' for Iframe must be a https protocol but is not.",
        ),
      ).toBeTruthy();
    });
  });
});
