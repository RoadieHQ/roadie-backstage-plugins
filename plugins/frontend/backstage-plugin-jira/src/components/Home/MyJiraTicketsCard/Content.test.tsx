import { rest } from 'msw';
import { AnyApiRef } from '@backstage/core-plugin-api';
import {
  MockFetchApi,
  wrapInTestApp,
  TestApiProvider,
  registerMswTestHooks,
} from '@backstage/test-utils';
import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { userResponseStub, searchResponseStub } from '../../../responseStubs';
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { Content } from './Content';
import { JiraAPI, jiraApiRef } from '../../../api';
import { ConfigReader } from '@backstage/config';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const fetchApi = new MockFetchApi();
const configApi = new ConfigReader({});

const apis: [AnyApiRef, Partial<unknown>][] = [
  [jiraApiRef, new JiraAPI({ discoveryApi, configApi, fetchApi })],
];

describe('MyJiraTicketsCard', () => {
  const worker = setupServer();
  registerMswTestHooks(worker);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should display error in displaying tickets', async () => {
    worker.use(
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(searchResponseStub)),
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

    expect(
      await screen.findByText('Error loading tickets: ', {
        exact: false,
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText('failed to fetch data, status 404: Not Found', {
        exact: false,
      }),
    ).toBeInTheDocument();
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

  it('should display found tickets', async () => {
    worker.use(
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(searchResponseStub)),
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
    );

    render(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Content userId="user1" />
        </TestApiProvider>,
      ),
      {},
    );

    const linkElement = await screen.findByText((_, element) => {
      return (
        element?.tagName.toLowerCase() === 'a' &&
        (element as HTMLAnchorElement).href ===
          'https://backstage-test.atlassian.net/browse/10003'
      );
    });

    expect(linkElement).toBeInTheDocument();
  });
});
