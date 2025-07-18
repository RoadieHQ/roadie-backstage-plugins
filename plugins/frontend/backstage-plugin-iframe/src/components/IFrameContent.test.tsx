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
  wrapInTestApp,
} from '@backstage/test-utils';
import { AnyApiRef, configApiRef } from '@backstage/core-plugin-api';
import { IFrameContent } from './IFrameContent';
import { EntityProvider } from '@backstage/plugin-catalog-react';

const config = {
  getOptionalStringArray: (_: string) => {
    return undefined;
  },
  getOptionalConfig: (_: string) => undefined,
};
const apis: [AnyApiRef, Partial<unknown>][] = [[configApiRef, config]];

const mockEntity = {
  apiVersion: '1',
  kind: 'a',
  metadata: {
    name: 'Example Service',
    annotations: {},
  },
};

describe('IFrameContent', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  setupRequestMockHandlers(server);
  const props = {
    iframe: {
      src: 'https://example.com',
      title: 'some title',
    },
  };

  describe('when props are set', () => {
    it('should render container for the iframe', async () => {
      const rendered = render(
        wrapInTestApp(
          <TestApiProvider apis={apis}>
            <EntityProvider entity={mockEntity}>
              <IFrameContent {...props} />
            </EntityProvider>
          </TestApiProvider>,
        ),
      );
      expect(await rendered.findByText('some title')).toBeTruthy();
    });
  });

  describe('when props are not set', () => {
    it('should not render the iframe', async () => {
      const rendered = render(
        wrapInTestApp(
          <TestApiProvider apis={apis}>
            <EntityProvider entity={mockEntity}>
              <IFrameContent {...{ iframe: { src: '' } }} />
            </EntityProvider>
          </TestApiProvider>,
        ),
      );
      expect(
        await rendered.findByText(
          'No src field provided. Please pass it in as a prop to populate the iframe.',
        ),
      ).toBeTruthy();
    });
  });

  describe('when title is overwritten', () => {
    it('should not render the iframe', async () => {
      const rendered = render(
        wrapInTestApp(
          <TestApiProvider apis={apis}>
            <EntityProvider entity={mockEntity}>
              <IFrameContent
                {...{
                  iframe: { src: 'https://hello.com' },
                  title: 'some title',
                }}
              />
            </EntityProvider>
          </TestApiProvider>,
        ),
      );
      expect(await rendered.findByText('some title')).toBeTruthy();
    });
  });
});
