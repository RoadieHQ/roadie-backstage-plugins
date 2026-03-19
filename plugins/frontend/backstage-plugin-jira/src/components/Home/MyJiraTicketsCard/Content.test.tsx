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

import { rest } from 'msw';
import { AnyApiRef, errorApiRef } from '@backstage/core-plugin-api';
import {
  MockFetchApi,
  wrapInTestApp,
  TestApiProvider,
  registerMswTestHooks,
} from '@backstage/test-utils';
// We don't need to import act as we're using screen.findBy... for async updates
import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { userResponseStub, searchResponseStub } from '../../../responseStubs';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { setupServer } from 'msw/node';
import { Content } from './Content';
import { JiraAPI, jiraApiRef } from '../../../api';
import { ConfigReader } from '@backstage/config';
import { featureFlagsApiRef } from '@backstage/core-plugin-api';
import userEvent from '@testing-library/user-event';

// Enhance searchResponseStub with the new fields we need for the enhanced display
const enhancedSearchResponse = {
  ...searchResponseStub,
  issues: searchResponseStub.issues.map((issue: any) => ({
    ...issue,
    id: `id-${issue.key}`,
    fields: {
      ...issue.fields,
      comment: {
        comments: [{ body: 'This is the most recent comment for this ticket' }],
      },
    },
    changelog: {
      histories: [
        {
          created: '2025-01-01T10:00:00.000Z',
          items: [{ field: 'assignee', to: 'user1' }],
        },
      ],
    },
    linkedPullRequests: [
      {
        id: 101,
        name: 'PR-123',
        status: 'OPEN',
        author: 'developer1',
        updatedDate: '2025-05-15T14:30:00.000Z',
        url: 'https://bitbucket.org/repo/PR-123',
      },
    ],
  })),
};

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const fetchApi = new MockFetchApi();
const configApi = new ConfigReader({});

// Create a mock feature flags API with the linked PRs feature enabled by default
const mockFeatureFlagsApi = {
  isActive: jest.fn().mockImplementation(flagName => {
    // Enable the feature flag by default in tests
    return flagName === 'jira-show-linked-prs' ? true : false;
  }),
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [jiraApiRef, new JiraAPI({ discoveryApi, configApi, fetchApi })],
  [errorApiRef, { post: jest.fn(), error$: jest.fn() }],
  [featureFlagsApiRef, mockFeatureFlagsApi],
];

describe('MyJiraTicketsCard', () => {
  const worker = setupServer();
  registerMswTestHooks(worker);

  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    // Reset the feature flag mock to enable linked PRs by default
    mockFeatureFlagsApi.isActive.mockImplementation(flagName => {
      return flagName === 'jira-show-linked-prs' ? true : false;
    });
  });

  it('should display error in displaying tickets', async () => {
    worker.use(
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(enhancedSearchResponse)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/user',
        (_, res, ctx) => {
          return res(ctx.status(404));
        },
      ),
    );

    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content userId="" />
        </TestApiProvider>,
      ),
      {},
    );

    // Find the exact error message
    const errorElement = await screen.findByText(content => {
      return content.startsWith('Error loading jira tickets:');
    });
    expect(errorElement).toBeInTheDocument();
    expect(errorElement.textContent).toMatch(
      /Error loading jira tickets: failed to fetch data, status 404: Not Found/,
    );
  });

  it('should display no tickets found', async () => {
    worker.use(
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) =>
          res(
            ctx.json({
              maxResults: 50,
              total: 0,
              issues: [],
            }),
          ),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/user',
        (req, res, ctx) => {
          const username = req.url.searchParams.get('username');
          if (username === 'user1') {
            return res(ctx.json(userResponseStub));
          }
          return res(ctx.status(404));
        },
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/issue/:issueKey',
        (_, res, ctx) => {
          return res(
            ctx.json({
              fields: {
                comment: {
                  comments: [
                    { body: 'This is the most recent comment for this ticket' },
                  ],
                },
              },
              changelog: {
                histories: [
                  {
                    created: '2025-01-01T10:00:00.000Z',
                    items: [{ field: 'assignee', to: 'user1' }],
                  },
                ],
              },
            }),
          );
        },
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/dev-status/1.0/issue/detail',
        (_, res, ctx) => {
          return res(
            ctx.json({
              detail: [
                {
                  pullRequests: [],
                },
              ],
            }),
          );
        },
      ),
    );

    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content userId="user1" />
        </TestApiProvider>,
      ),
      {},
    );

    expect(
      await screen.findByText('No tickets to show', {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it('should display found tickets with correct table title', async () => {
    worker.use(
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(enhancedSearchResponse)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/user',
        (req, res, ctx) => {
          const username = req.url.searchParams.get('username');
          if (username === 'user1') {
            return res(ctx.json(userResponseStub));
          }
          return res(ctx.status(404));
        },
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/issue/:issueKey',
        (_, res, ctx) => {
          return res(
            ctx.json({
              fields: {
                comment: {
                  comments: [
                    { body: 'This is the most recent comment for this ticket' },
                  ],
                },
              },
              changelog: {
                histories: [
                  {
                    created: '2025-01-01T10:00:00.000Z',
                    items: [{ field: 'assignee', to: 'user1' }],
                  },
                ],
              },
            }),
          );
        },
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/dev-status/1.0/issue/detail',
        (_, res, ctx) => {
          return res(
            ctx.json({
              detail: [
                {
                  pullRequests: [
                    {
                      id: 101,
                      name: 'PR-123',
                      status: 'OPEN',
                      author: 'developer1',
                      updatedDate: '2025-05-15T14:30:00.000Z',
                      url: 'https://bitbucket.org/repo/PR-123',
                    },
                  ],
                },
              ],
            }),
          );
        },
      ),
    );

    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content userId="user1" />
        </TestApiProvider>,
      ),
      {},
    );

    await waitForElementToBeRemoved(() => screen.getByTestId('progress'));

    // Wait for the content to load first
    const tables = screen.getAllByRole('table');
    // const tables = await screen.findAllByRole('table');
    expect(tables.length).toBeGreaterThan(0);

    // We'll use the first table found
    const table = tables[0];
    const rowLinks = within(table).getAllByRole('link');
    const ticketLink = rowLinks.find(
      link =>
        link.getAttribute('href') ===
        'https://backstage-test.atlassian.net/browse/10003',
    );
    expect(ticketLink).toBeInTheDocument();

    // Check that table title is displayed with ticket count
    await waitFor(() => {
      expect(screen.getByText('My Tickets (1)')).toBeInTheDocument();
    });

    const headers = [
      'Issue Key',
      'Summary',
      'Status',
      'Linked PR(S)',
      'Last Comment',
      'Assigned',
    ];

    for (const header of headers) {
      await waitFor(() => {
        const el = screen.getByText((content, element) => {
          return (
            !!element && content.toLowerCase().includes(header.toLowerCase())
          );
        });
        expect(el).toBeInTheDocument();
      });
    }

    // Check for truncated comment with tooltip
    const commentElement = await screen.findByText(
      'This is the most recent comment for this ticket',
    );
    expect(commentElement).toBeInTheDocument();
  });

  it('should display PR dialog when clicking on PR count with feature flag enabled', async () => {
    // Explicitly enable the feature flag for this test
    mockFeatureFlagsApi.isActive.mockImplementation(flagName => {
      return flagName === 'jira-show-linked-prs' ? true : false;
    });
    worker.use(
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(enhancedSearchResponse)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/user',
        (req, res, ctx) => {
          const username = req.url.searchParams.get('username');
          if (username === 'user1') {
            return res(ctx.json(userResponseStub));
          }
          return res(ctx.status(404));
        },
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/issue/:issueKey',
        (_, res, ctx) => {
          return res(
            ctx.json({
              fields: {
                comment: {
                  comments: [
                    { body: 'This is the most recent comment for this ticket' },
                  ],
                },
              },
              changelog: {
                histories: [
                  {
                    created: '2025-01-01T10:00:00.000Z',
                    items: [{ field: 'assignee', to: 'user1' }],
                  },
                ],
              },
            }),
          );
        },
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/dev-status/1.0/issue/detail',
        (_, res, ctx) => {
          return res(
            ctx.json({
              detail: [
                {
                  pullRequests: [
                    {
                      id: 101,
                      name: 'PR-123',
                      status: 'OPEN',
                      author: 'developer1',
                      updatedDate: '2025-05-15T14:30:00.000Z',
                      url: 'https://bitbucket.org/repo/PR-123',
                    },
                  ],
                },
              ],
            }),
          );
        },
      ),
    );

    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content userId="user1" />
        </TestApiProvider>,
      ),
      {},
    );

    // Wait for content to load first
    await screen.findByText('10003');

    // Find the table - using getAllByRole since Material Table might create multiple tables
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBeGreaterThan(0);

    // We'll use the first table found
    const table = tables[0];

    // Find all links within the table
    const rowLinks = within(table).getAllByRole('link');
    const ticketLink = rowLinks.find(
      link =>
        link.getAttribute('href') ===
        'https://backstage-test.atlassian.net/browse/10003',
    );
    expect(ticketLink).toBeInTheDocument();

    // Wait for table to fully load and render fully
    // First, we get the Linked PRs column header
    const linkedPRsHeader = await screen.findByRole('columnheader', {
      name: /linked pr\(s\)/i,
    });
    expect(linkedPRsHeader).toBeInTheDocument();

    // Give time for all content to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find a cell that has a text content of '1' (the PR count)
    const prCountSpan = await screen.findByText('1');

    // Make sure we found the element
    expect(prCountSpan).not.toBeUndefined();
    expect(prCountSpan).toBeInTheDocument();

    // Click on PR count
    if (prCountSpan) {
      await userEvent.click(prCountSpan);
    }

    // Check that dialog appears - find the dialog title which includes the ticket ID
    const dialogTitle = await screen.findByRole('heading', {
      name: /Linked Pull Requests for/i,
    });
    expect(dialogTitle).toBeInTheDocument();

    // Check dialog content (we need to wait for the dialog content to appear)
    await expect(screen.findByText('PR-123')).resolves.toBeInTheDocument();
    await expect(screen.findByText('OPEN')).resolves.toBeInTheDocument();
    await expect(screen.findByText('Unknown')).resolves.toBeInTheDocument(); // Component renders 'Unknown' instead of 'developer1'
  });

  it('should display tickets with pagination', async () => {
    // Create a response with multiple tickets to test pagination
    const multiTicketResponse = {
      ...enhancedSearchResponse,
      issues: Array(15)
        .fill(enhancedSearchResponse.issues[0])
        .map((issue, i) => ({
          ...issue,
          key: `KEY-${i + 1}`,
          id: `issue-${i + 1}`,
          self: `https://backstage-test.atlassian.net/rest/api/2/issue/issue-${
            i + 1
          }`,
        })),
    };

    worker.use(
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(multiTicketResponse)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/user',
        (_, res, ctx) => res(ctx.json(userResponseStub)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/issue/:issueKey',
        (_, res, ctx) => {
          return res(
            ctx.json({
              fields: {
                comment: {
                  comments: [
                    { body: 'This is the most recent comment for this ticket' },
                  ],
                },
              },
              changelog: {
                histories: [
                  {
                    created: '2025-01-01T10:00:00.000Z',
                    items: [{ field: 'assignee', to: 'user1' }],
                  },
                ],
              },
            }),
          );
        },
      ),
    );

    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content userId="user1" />
        </TestApiProvider>,
      ),
      {},
    );

    // Wait for tickets to load
    await screen.findByText('KEY-1');

    // Wait for the tickets title to load with correct count
    await screen.findByText(/My Tickets \(15\)/i);

    // Verify we can see the first page of tickets
    expect(screen.getByText('KEY-1')).toBeInTheDocument();
    expect(screen.getByText('KEY-10')).toBeInTheDocument();

    // Check pagination info exists (using findAllByText since Material Table can render multiple elements with the same text)
    const paginationElements = await screen.findAllByText(/1-10 of 15/);
    expect(paginationElements.length).toBeGreaterThan(0);
    expect(paginationElements[0]).toBeInTheDocument();

    // Verify that tickets from the second page are not visible
    expect(screen.queryByText('KEY-11')).not.toBeInTheDocument();
    expect(screen.queryByText('KEY-15')).not.toBeInTheDocument();
  });

  it('should render the search input for filtering tickets', async () => {
    // Create a response with tickets that have different summaries for testing search
    const multiTicketResponse = {
      ...enhancedSearchResponse,
      issues: [
        {
          ...enhancedSearchResponse.issues[0],
          id: 'ticket-1',
          key: 'TICKET-1',
          self: 'https://backstage-test.atlassian.net/rest/api/2/issue/ticket-1',
          fields: {
            ...enhancedSearchResponse.issues[0].fields,
            summary: 'First test ticket',
          },
        },
        {
          ...enhancedSearchResponse.issues[0],
          id: 'ticket-2',
          key: 'TICKET-2',
          self: 'https://backstage-test.atlassian.net/rest/api/2/issue/ticket-2',
          fields: {
            ...enhancedSearchResponse.issues[0].fields,
            summary: 'Second test ticket',
          },
        },
      ],
    };

    worker.use(
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(multiTicketResponse)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/user',
        (_, res, ctx) => res(ctx.json(userResponseStub)),
      ),
    );

    const user = userEvent.setup();
    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content userId="user" />
        </TestApiProvider>,
      ),
    );

    // Wait for the tickets to be loaded and rendered
    await screen.findByText('TICKET-1');
    await screen.findByText('TICKET-2');

    // Wait a moment for all content to render fully
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find the Material Table's search input by its placeholder text 'Filter'
    const searchInput = await screen.findByPlaceholderText('Search tickets');
    expect(searchInput).toBeInTheDocument();

    // Type a search query to find only the first ticket
    await user.type(searchInput, 'First');

    // Allow time for filtering to apply
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify search filtering - should now only see the first ticket
    await waitFor(() => {
      expect(screen.getByText('TICKET-1')).toBeInTheDocument();
      expect(screen.queryByText('TICKET-2')).not.toBeInTheDocument();
    });

    // Clear the search input
    await user.clear(searchInput);

    // Allow time for filtering to reset
    await new Promise(resolve => setTimeout(resolve, 500));

    await waitFor(() => {
      expect(screen.getByText('TICKET-1')).toBeInTheDocument();
      expect(screen.getByText('TICKET-2')).toBeInTheDocument();
    });

    // Verify the search clear button is present
    const clearButton = screen.getByLabelText('Clear Search');
    expect(clearButton).toBeInTheDocument();
  }, 10000);

  it('should hide linked PRs column when feature flag is disabled', async () => {
    // Mock the feature flag to return false for the linked PRs feature
    mockFeatureFlagsApi.isActive.mockImplementation(flagName => {
      return flagName === 'jira-show-linked-prs' ? false : false;
    });

    worker.use(
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/user',
        (_, res, ctx) => res(ctx.json(userResponseStub)),
      ),
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(enhancedSearchResponse)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/issue/10003',
        (_, res, ctx) => res(ctx.json(enhancedSearchResponse.issues[0])),
      ),
    );

    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content userId="user1" />
        </TestApiProvider>,
      ),
      {},
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId('progress'));

    // Wait for the table to load
    const tables = await screen.findAllByRole('table');
    expect(tables.length).toBeGreaterThan(0);

    // Look for basic columns that should always be visible
    await waitFor(() => {
      expect(screen.getByText(/Issue Key/i)).toBeInTheDocument();
      expect(screen.getByText(/Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Last Comment/i)).toBeInTheDocument();
    });

    // Verify that the Linked PRs column is NOT visible
    expect(screen.queryByText(/Linked PR(S)/i)).not.toBeInTheDocument();

    // Make sure clicking on a ticket doesn't open the PR dialog
    const ticketLink = await screen.findByText('10003');
    userEvent.click(ticketLink);

    // Verify PR dialog doesn't appear
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(
      screen.queryByText(/Linked Pull Requests for/i),
    ).not.toBeInTheDocument();
  });
});
