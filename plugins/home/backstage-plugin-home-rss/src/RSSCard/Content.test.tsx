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

import { FetchApi, fetchApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { cleanup, render, screen } from '@testing-library/react';
import { Content } from './Content';

const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
        <title>RSS Title</title>
        <description>This is an example of an RSS feed</description>
        <link>http://www.example.com/main.html</link>
        <copyright>2020 Example.com All rights reserved</copyright>
        <lastBuildDate>Mon, 06 Sep 2010 00:01:00 +0000</lastBuildDate>
        <pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>
        <ttl>1800</ttl>

        <item>
            <title>Example entry</title>
            <description>Here is some text containing an interesting description.</description>
            <link>http://www.example.com/blog/post/1</link>
            <guid isPermaLink="false">7bd204c6-1655-4c27-aeee-53f933c5395f</guid>
            <pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>
        </item>

    </channel>
</rss>
`;

// RSSContent uses rect-RSS which throws a type error in the tests so we are mocking it checking the plain text in the components.
jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  RSSContent: ({ content }: { content: string }) => <span>{content}</span>,
}));

const fetchApi = {
  fetch: jest.fn(async (url: string): Promise<Partial<Response>> => {
    if (url.endsWith('test-feed')) {
      return {
        text: async () => rssFeed,
        status: 200,
      };
    } else if (url.endsWith('not-found')) {
      return {
        text: async () => 'Not Found',
        status: 404,
      };
    }
    throw new Error('Unexpected Error');
  }),
} as Partial<FetchApi>;

describe('<RSSContent>', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render RSS card', async () => {
    render(
      wrapInTestApp(
        <TestApiProvider apis={[[fetchApiRef, fetchApi]]}>
          <Content feedURL="https://example.com/test-feed" />
        </TestApiProvider>,
      ),
      {},
    );

    expect(
      await screen.findByText('Example entry', { exact: true }),
    ).toBeInTheDocument();
  });
});
