import { mockApis, MockFetchApi, registerMswTestHooks } from '@backstage/test-utils';
import { JiraAPI } from './index';
import { JiraProductStrategyFactory } from './strategies';
import { JiraCloudStrategy } from './strategies/cloud';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const worker = setupServer();

describe('JiraAPI', () => {
  registerMswTestHooks(worker);

  const discoveryApi = mockApis.discovery();
  const fetchApi = new MockFetchApi();

  const strategyFactorySpy = jest.spyOn(JiraProductStrategyFactory, 'createStrategy');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should default to cloud strategy when no product is configured', () => {
    const configApi = mockApis.config();

    const options = {
      discoveryApi,
      configApi,
      fetchApi,
    };
    new JiraAPI(options);

    expect(strategyFactorySpy).toHaveBeenCalledWith('cloud', options);
  });

  it('should default to cloud strategy when product cloud is configured', () => {
    const configApi = mockApis.config({ data: { jira: { product: 'cloud' } } });

    const options = {
      discoveryApi,
      configApi,
      fetchApi,
    };
    new JiraAPI(options);

    expect(strategyFactorySpy).toHaveBeenCalledWith('cloud', options);
  });

  it('should default to cloud strategy when product data center is configured', () => {
    const configApi = mockApis.config({ data: { jira: { product: 'datacenter' } } });

    const options = {
      discoveryApi,
      configApi,
      fetchApi,
    };
    new JiraAPI(options);

    expect(strategyFactorySpy).toHaveBeenCalledWith('datacenter', options);
  });

  describe('jqlQuery', () => {
    const jiraApi = new JiraAPI({
      discoveryApi,
      configApi: mockApis.config(),
      fetchApi,
    });

    const pagedIssuesRequestSpy = jest.spyOn(JiraCloudStrategy.prototype, 'pagedIssuesRequest');

    it("should call the strategy's pagedIssuesRequest method", async () => {
      const query = 'foo';
      const maxResults = 50;

      pagedIssuesRequestSpy.mockImplementation();
      await jiraApi.jqlQuery(query, maxResults);

      expect(pagedIssuesRequestSpy).toHaveBeenCalledWith(expect.any(String), query, maxResults);
    });
  });

  describe('getUserDetails', () => {
    const jiraApi = new JiraAPI({
      discoveryApi,
      configApi: mockApis.config(),
      fetchApi,
    });

    const pagedIssuesRequestSpy = jest.spyOn(JiraCloudStrategy.prototype, 'pagedIssuesRequest');

    beforeEach(() => {
      worker.use(
        rest.get('http://example.com/api/proxy/jira/api/rest/api/latest/user', (_, res, ctx) =>
          res(
            ctx.status(200),
            ctx.json({
              avatarUrls: { '48x48': 'http://example.com' },
              self: 'http://example.com',
            }),
          ),
        ),
      );
    });

    it("should call the strategy's pagedIssuesRequest method", async () => {
      const userId = 'foo';

      pagedIssuesRequestSpy.mockResolvedValue([]);
      await jiraApi.getUserDetails(userId);

      expect(pagedIssuesRequestSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(userId),
      );
    });
  });
});
