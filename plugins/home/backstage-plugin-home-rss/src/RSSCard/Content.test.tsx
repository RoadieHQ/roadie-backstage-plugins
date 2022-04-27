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
import { AnyApiRef } from '@backstage/core-plugin-api';
import {
  wrapInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { render, screen, cleanup } from '@testing-library/react';
import { Content } from './Content';
// eslint-disable-next-line no-restricted-imports
import { readFileSync } from "fs";

const rssFeed = readFileSync('fixtures/rssFeed.xml', "utf-8");

global.fetch = jest.fn(async (url: string) => {
      if (url.endsWith('test-feed')) {
        return {
          text: () => rssFeed,
          status: 200,
          headers: {
            "Content-Type": "application/rss+xml"
          }
        }
      } else if (url.endsWith('not-found')) {
        return {
          data: "Not Found",
          status: 404,
          headers: {
            "Content-Type": "plain/text"
          },
        }
      }
      throw new Error('Unexpected Error');
    }
) as jest.Mock;

// RSSContent uses rect-RSS which throws a type error in the tests so we are mocking it checking the plain text in the components.
jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  RSSContent: ({ content }: { content: string }) => <span>{content}</span>,
}));

const apis: [AnyApiRef, Partial<unknown>][] = [];

describe('<RSSContent>', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render RSS card', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content
            feedURL="https://example.com/test-feed"
          />
        </TestApiProvider>,
      ),
      {},
    );

    expect(await screen.findByText('Example entry', { exact: true })).toBeInTheDocument();
  });

  describe('where there is an error retrieving the feed', () => {
    it('should render an error card', async () => {
      render(
          wrapInTestApp(
              <TestApiProvider apis={apis}>
                <Content
                    feedURL="https://example.com/not-found"
                />
              </TestApiProvider>,
          ),
          {},
      );

      expect(await screen.findByText('Failed to retrieve RSS Feed: 404', { exact: true })).toBeInTheDocument();
    });
  })

  describe('where there is an unexpected error retrieving the feed', () => {
    it('should render an error card', async () => {
      render(
          wrapInTestApp(
              <TestApiProvider apis={apis}>
                <Content
                    feedURL="https://example.com/bad-url"
                />
              </TestApiProvider>,
          ),
          {},
      );

      expect(await screen.findByText('Failed to retrieve RSS Feed: Unexpected Error', { exact: true })).toBeInTheDocument();
    });
  })
});
