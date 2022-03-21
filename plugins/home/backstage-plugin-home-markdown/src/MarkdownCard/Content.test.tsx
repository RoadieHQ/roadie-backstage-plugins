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
import { AnyApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';
import {
  wrapInTestApp,
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import { render, screen, cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { Content } from './Content';
import { handlers } from '../mocks/handlers';

// MarkdownContent uses rect-markdown which throws a type error in the tests so we are mocking it checking the plain text in the components.
jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  MarkdownContent: ({ content }: { content: string }) => <span>{content}</span>,
}));
const mockAccessToken = jest.fn().mockImplementation(async (_: string[]) => 'test-token');
const mockGithubAuth = {
  getAccessToken: mockAccessToken,
  sessionState$: jest.fn(() => ({
    subscribe: (fn: (a: string) => void) => {
      fn('SignedIn');
      return { unsubscribe: jest.fn() };
    },
  })),
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [githubAuthApiRef, mockGithubAuth],
];
describe('<MarkdownContent>', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);
  afterEach(() => {
    worker.resetHandlers();
    cleanup();
  });
  beforeEach(() => {
    worker.use(...handlers);
  });
  it('should render sign in page', async () => {
    const mockGithubUnAuth = {
      getAccessToken: async (_: string[]) => 'test-token',
      sessionState$: jest.fn(() => ({
        subscribe: (fn: (a: string) => void) => {
          fn('SignedOut');
          return { unsubscribe: jest.fn() };
        },
      })),
    };

    const api: [AnyApiRef, Partial<unknown>][] = [
      [githubAuthApiRef, mockGithubUnAuth],
    ];
    render(
      wrapInTestApp(
        <TestApiProvider apis={api}>
          <Content
            owner="test"
            path=".backstage/home-page.md"
            repo="roadie-backstage-plugins"
          />
        </TestApiProvider>,
      ),
      {},
    );

    expect(
      await screen.findByText('You are not logged into github.', {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
  it('should render markdown card', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content
            owner="test"
            path=".backstage/home-page.md"
            repo="roadie-backstage-plugins"
          />
        </TestApiProvider>,
      ),
      {},
    );

    expect(await screen.findByText('⭐', { exact: false })).toBeInTheDocument();
  });
  it('should render markdown card from a different branch', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content
            owner="test"
            path=".backstage/home-page.md"
            repo="foo-bar"
            branch="not-default"
          />
        </TestApiProvider>,
      ),
    );

    expect(
      await screen.findByText('# Awesome test markdown', { exact: false }),
    ).toBeInTheDocument();
  });

  describe('it fails to get the content', () =>{
    beforeEach(() => {
      mockAccessToken.mockImplementation(()=> { throw new Error('No :(')});
    });

    it('shouldn\'t render the markdown card but display an error', async () => {
      render(
        wrapInTestApp(
          <TestApiProvider apis={apis}>
            <Content
              owner="test"
              path=".backstage/home-page.md"
              repo="foo-bar"
              branch="not-default"
            />
          </TestApiProvider>,
        ),
      );
  
      expect(
        await screen.findByText('Unable to gather markdown contents: No :(', { exact: false }),
      ).toBeInTheDocument();
    });
  });
});
