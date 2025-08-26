/*
 * Copyright 2025 Larder Software Limited
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

/* eslint-disable no-new */

import { MockFetchApi, mockApis, registerMswTestHooks } from '@backstage/test-utils';
import { JiraAPI } from './index';
import { JiraProductStrategyFactory } from './strategies';
import { JiraCloudStrategy } from './strategies/cloud';
import { ErrorApi } from '@backstage/core-plugin-api';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const worker = setupServer();

describe('JiraAPI', () => {
  registerMswTestHooks(worker);

  const discoveryApi = mockApis.discovery();
  const fetchApi = new MockFetchApi();

  // Create a simple custom ErrorApi mock that doesn't throw validation errors
  class SimpleErrorApiMock implements ErrorApi {
    private errors: Array<{message: string}> = [];
  
    post(error: Error): void {
      this.errors.push(error);
    }
  
    error$: any = { subscribe: () => ({ unsubscribe: () => {} }) };
  
    getErrors(): Array<{message: string}> {
      return this.errors;
    }
  
    clearErrors(): void {
      this.errors = [];
    }
  }

  const errorApi = new SimpleErrorApiMock();

  const strategyFactorySpy = jest.spyOn(
    JiraProductStrategyFactory,
    'createStrategy',
  );

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

  it('should use cloud strategy when product cloud is configured', () => {
    const configApi = mockApis.config({ data: { jira: { product: 'cloud' } } });

    const options = {
      discoveryApi,
      configApi,
      fetchApi,
    };
    new JiraAPI(options);

    expect(strategyFactorySpy).toHaveBeenCalledWith('cloud', options);
  });

  it('should use data center strategy when product data center is configured', () => {
    const configApi = mockApis.config({
      data: { jira: { product: 'datacenter' } },
    });

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

    const pagedIssuesRequestSpy = jest.spyOn(
      JiraCloudStrategy.prototype,
      'pagedIssuesRequest',
    );

    it("should call the strategy's pagedIssuesRequest method", async () => {
      const query = 'foo';
      const maxResults = 50;

      pagedIssuesRequestSpy.mockImplementation();
      await jiraApi.jqlQuery(query, maxResults);

      expect(pagedIssuesRequestSpy).toHaveBeenCalledWith(
        expect.any(String),
        query,
        maxResults,
      );
    });
  });

  describe('getStatuses', () => {
    const jiraApi = new JiraAPI({
      discoveryApi,
      configApi: mockApis.config(),
      fetchApi,
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return unique status names excluding Done category', async () => {
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/api/latest/project/TEST/statuses',
          (_, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json([
                {
                  id: '1',
                  name: 'Bug',
                  statuses: [
                    { 
                      id: '10000', 
                      name: 'To Do',
                      statusCategory: { name: 'To Do' } 
                    },
                    { 
                      id: '10001', 
                      name: 'In Progress',
                      statusCategory: { name: 'In Progress' }
                    },
                    { 
                      id: '10002', 
                      name: 'Done',
                      statusCategory: { name: 'Done' }
                    },
                  ],
                },
                {
                  id: '2',
                  name: 'Task',
                  statuses: [
                    { 
                      id: '10003', 
                      name: 'To Do',
                      statusCategory: { name: 'To Do' } 
                    },
                    { 
                      id: '10004', 
                      name: 'Review',
                      statusCategory: { name: 'In Progress' }
                    },
                  ],
                },
              ]),
            ),
        ),
      );

      const result = await jiraApi.getStatuses('TEST');
      
      expect(result).toContain('To Do');
      expect(result).toContain('In Progress');
      expect(result).toContain('Review');
      expect(result).not.toContain('Done');
    });

    it('should handle API errors', async () => {
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/api/latest/project/ERROR/statuses',
          (_, res, ctx) =>
            res(
              ctx.status(404),
              ctx.json({ error: 'Project not found' }),
            ),
        ),
      );

      await expect(jiraApi.getStatuses('ERROR')).rejects.toThrow(
        'failed to fetch data, status 404'
      );
    });
  });

  describe('getIssueDetails', () => {
    const jiraApi = new JiraAPI({
      discoveryApi,
      configApi: mockApis.config(),
      fetchApi,
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return issue details with changelog', async () => {
      const mockIssueDetails = {
        id: '10000',
        key: 'TEST-123',
        fields: {
          summary: 'Test Issue',
          status: {
            name: 'In Progress',
            statusCategory: { name: 'In Progress' }
          },
          comment: {
            comments: [
              { 
                body: 'First comment',
                created: '2025-08-01T10:00:00.000Z'
              },
              {
                body: 'Latest comment',
                created: '2025-08-05T15:30:00.000Z'
              }
            ]
          },
          created: '2025-07-15T09:00:00.000Z',
          updated: '2025-08-05T15:30:00.000Z',
          assignee: {
            displayName: 'Test User',
            avatarUrls: { '48x48': 'http://example.com/avatar.png' }
          }
        },
        changelog: {
          histories: [
            {
              created: '2025-08-03T10:00:00.000Z',
              items: [
                {
                  field: 'assignee',
                  fromString: null,
                  toString: 'Test User'
                }
              ]
            }
          ]
        }
      };

      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/api/latest/issue/TEST-123',
          (_, res, ctx) => res(ctx.status(200), ctx.json(mockIssueDetails)),
        ),
      );

      const result = await jiraApi.getIssueDetails('TEST-123');
      
      expect(result).toEqual(mockIssueDetails);
      expect(result.changelog).toBeDefined();
      expect(result.fields.comment.comments).toHaveLength(2);
    });

    it('should handle issue not found', async () => {
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/api/latest/issue/NOTFOUND-1',
          (_, res, ctx) =>
            res(
              ctx.status(404),
              ctx.json({ errorMessages: ['Issue does not exist'] }),
            ),
        ),
      );

      await expect(jiraApi.getIssueDetails('NOTFOUND-1')).rejects.toThrow(
        'Failed to fetch issue details'
      );
    });
  });

  describe('getUserDetails', () => {
    // Create an instance with errorApi for testing error logging
    const jiraApi = new JiraAPI({
      discoveryApi,
      configApi: mockApis.config(),
      fetchApi,
      errorApi,
    });

    const pagedIssuesRequestSpy = jest.spyOn(
      JiraCloudStrategy.prototype,
      'pagedIssuesRequest',
    );
    
    const getIssueDetailsSpy = jest.spyOn(
      JiraAPI.prototype,
      'getIssueDetails',
    );

    const getLinkedPullRequestsSpy = jest.spyOn(
      JiraAPI.prototype,
      'getLinkedPullRequests',
    );

    beforeEach(() => {
      jest.clearAllMocks();
      errorApi.clearErrors();
      // We still want to keep our spies, so don't restore them
      // Instead, we'll just reset them
      pagedIssuesRequestSpy.mockReset();
      getIssueDetailsSpy.mockReset();
      getLinkedPullRequestsSpy.mockReset();
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/api/latest/user',
          (_, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                accountId: 'user123',
                displayName: 'Test User',
                avatarUrls: { '48x48': 'http://example.com/avatar.jpg' },
                self: 'http://example.com/user',
              }),
            ),
        ),
        // Add handler for jql search endpoint used by pagedIssuesRequest
        rest.post(
          'http://example.com/api/proxy/jira/api/rest/api/latest/search/jql',
          (_, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                issues: [
                  {
                    key: 'TEST-123',
                    id: '12345',
                    self: 'http://example.com/jira/rest/api/2/issue/12345',
                    fields: {
                      summary: 'Test issue',
                      status: { name: 'In Progress', iconUrl: 'http://example.com/status-icon.png' },
                      issuetype: { name: 'Task', iconUrl: 'http://example.com/task-icon.png' },
                      priority: { name: 'Medium', iconUrl: 'http://example.com/priority-icon.png' },
                      created: '2025-08-25T10:00:00.000Z',
                      updated: '2025-08-26T11:00:00.000Z'
                    }
                  }
                ],
                startAt: 0,
                maxResults: 50,
                total: 1
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
    
    it('should handle errors from getIssueDetails and log them via ErrorApi', async () => {
      const userId = 'test-user';
      const mockIssue = {
        key: 'TEST-123',
        id: '12345',
        self: 'http://example.com/jira/rest/api/2/issue/12345',
        fields: {
          summary: 'Test Issue',
          assignee: {
            displayName: 'Test User',
            avatarUrls: { '48x48': 'http://example.com/avatar.jpg' }
          },
          status: { name: 'In Progress', iconUrl: 'http://example.com/in-progress-icon.png' },
          issuetype: { name: 'Task', iconUrl: 'http://example.com/task-icon.png' },
          priority: { name: 'Medium', iconUrl: 'http://example.com/medium-priority-icon.png' },
          created: '2025-08-25T10:00:00.000Z',
          updated: '2025-08-26T11:00:00.000Z'
        }
      };
      
      // Mock the pagedIssuesRequest to return our test issue
      pagedIssuesRequestSpy.mockResolvedValue([mockIssue]);
      
      // Make getIssueDetails throw an error
      getIssueDetailsSpy.mockRejectedValue(new Error('Failed to fetch issue details'));
      
      // Mock getLinkedPullRequests to return empty array to isolate this test
      getLinkedPullRequestsSpy.mockResolvedValue([]);
      
      const result = await jiraApi.getUserDetails(userId);
      
      // Verify we still got ticket data despite the getIssueDetails error
      expect(result.tickets).toHaveLength(1);
      expect(result.tickets[0].key).toBe('TEST-123');
      
      // Verify error was logged via ErrorApi
      const errors = errorApi.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('Error fetching details for TEST-123');
    });
    
    it('should handle errors from getLinkedPullRequests and log them via ErrorApi', async () => {
      const userId = 'test-user';
      const mockIssue = {
        key: 'TEST-456',
        id: '67890',
        self: 'http://example.com/jira/rest/api/2/issue/67890',
        fields: {
          summary: 'Another Test Issue',
          assignee: {
            displayName: 'Test User',
            avatarUrls: { '48x48': 'http://example.com/avatar.jpg' }
          },
          status: { name: 'To Do', iconUrl: 'http://example.com/todo-icon.png' },
          issuetype: { name: 'Bug', iconUrl: 'http://example.com/bug-icon.png' },
          priority: { name: 'High', iconUrl: 'http://example.com/high-priority-icon.png' },
          created: '2025-08-24T09:00:00.000Z',
          updated: '2025-08-25T16:00:00.000Z'
        }
      };
      
      // Mock the pagedIssuesRequest to return our test issue
      pagedIssuesRequestSpy.mockResolvedValue([mockIssue]);
      
      // Mock getIssueDetails to return basic data
      getIssueDetailsSpy.mockResolvedValue({
        fields: {
          comment: {
            comments: [{ body: 'Test comment' }]
          }
        },
        changelog: {
          histories: [{
            created: '2025-08-24T10:00:00.000Z',
            items: [{ field: 'assignee', to: userId }]
          }]
        }
      });
      
      // Make getLinkedPullRequests throw an error
      getLinkedPullRequestsSpy.mockRejectedValue(new Error('Failed to fetch pull requests'));
      
      const result = await jiraApi.getUserDetails(userId);
      
      // Verify we still got ticket data with details but no PRs
      expect(result.tickets).toHaveLength(1);
      expect(result.tickets[0].key).toBe('TEST-456');
      expect(result.tickets[0].lastComment).toBe('Test comment');
      expect(result.tickets[0].linkedPullRequests).toEqual([]);
      
      // Verify error was logged via ErrorApi
      const errors = errorApi.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('Error fetching PRs for TEST-456'))).toBe(true);
    });
  });

  describe('getLinkedPullRequests', () => {
    const jiraApi = new JiraAPI({
      discoveryApi,
      configApi: mockApis.config(),
      fetchApi,
      errorApi,
    });
    
    beforeEach(() => {
      jest.clearAllMocks();
      errorApi.clearErrors();
      // Make sure we restore all mocks to prevent interference between tests
      jest.restoreAllMocks();
    });
    
    it('should return linked pull requests when found', async () => {
      // Define mock PR data that matches the structure expected by the function
      const mockPullRequests = [
        {
          id: 'PR-1',
          name: 'First PR',
          url: 'https://bitbucket.org/project/repo/pull-requests/1',
          status: 'OPEN',
          author: { name: 'Developer' },
          createdDate: '2025-08-25T10:30:00.000Z',
          lastUpdated: '2025-08-26T09:15:00.000Z',
        },
        {
          id: 'PR-2',
          name: 'Second PR',
          url: 'https://bitbucket.org/project/repo/pull-requests/2',
          status: 'MERGED',
          author: { name: 'Another Dev' },
          createdDate: '2025-08-24T14:20:00.000Z',
          lastUpdated: '2025-08-26T08:45:00.000Z',
        },
      ];
      
      // Reset all handlers to prevent interference
      worker.resetHandlers();
      
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/dev-status/1.0/issue/detail',
          (req, res, ctx) => {
            // Check for the correct query parameters
            const issueId = req.url.searchParams.get('issueId');
            const applicationType = req.url.searchParams.get('applicationType');
            const dataType = req.url.searchParams.get('dataType');
            
            if (issueId === 'TICKET-123' && applicationType === 'stash' && dataType === 'pullrequest') {
              return res(
                ctx.status(200),
                ctx.json({
                  detail: [
                    {
                      pullRequests: mockPullRequests,
                    },
                  ],
                }),
              );
            }
            return res(ctx.status(404));
          },
        ),
      );

      const result = await jiraApi.getLinkedPullRequests('TICKET-123');
      
      // Verify we get back the mock pull requests
      expect(result).toEqual(mockPullRequests);
      
      // Verify no errors were logged
      const errors = errorApi.getErrors();
      expect(errors.length).toBe(0);
    });

    it('should handle empty pull requests response', async () => {
      // Clear previous errors
      errorApi.clearErrors();
      
      worker.resetHandlers();
      
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/dev-status/1.0/issue/detail',
          (req, res, ctx) => {
            // Check for the correct query parameters
            const issueId = req.url.searchParams.get('issueId');
            const applicationType = req.url.searchParams.get('applicationType');
            const dataType = req.url.searchParams.get('dataType');
            
            if (issueId === 'NO-PR-123' && applicationType === 'stash' && dataType === 'pullrequest') {
              return res(
                ctx.status(200),
                ctx.json({
                  detail: [],
                }),
              );
            }
            return res(ctx.status(404));
          },
        ),
      );

      const result = await jiraApi.getLinkedPullRequests('NO-PR-123');
      expect(result).toEqual([]);
      
      // No error should be posted to errorApi
      const errors = errorApi.getErrors();
      expect(errors.length).toBe(0);
    });

    it('should handle API errors and log via ErrorApi', async () => {
      // Clear previous errors
      errorApi.clearErrors();
      
      worker.resetHandlers();
      
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/dev-status/1.0/issue/detail',
          (req, res, ctx) => {
            const issueId = req.url.searchParams.get('issueId');
            const applicationType = req.url.searchParams.get('applicationType');
            const dataType = req.url.searchParams.get('dataType');
            
            if (issueId === 'ERROR-123' && applicationType === 'stash' && dataType === 'pullrequest') {
              return res(ctx.status(500), ctx.json({ error: 'Server error' }));
            }
            return res(ctx.status(404));
          },
        ),
      );

      const result = await jiraApi.getLinkedPullRequests('ERROR-123');
      
      // Verify the result is empty array
      expect(result).toEqual([]);
      
      // Verify ErrorApi was called with the proper error message
      const errors = errorApi.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      // Check the error message
      expect(errors[0].message).toContain('Error fetching linked PRs for ERROR-123');
    });

    it('should handle malformed response', async () => {
      // Clear previous errors
      errorApi.clearErrors();
      
      worker.resetHandlers();
      
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/dev-status/1.0/issue/detail',
          (req, res, ctx) => {
            const issueId = req.url.searchParams.get('issueId');
            const applicationType = req.url.searchParams.get('applicationType');
            const dataType = req.url.searchParams.get('dataType');
            
            if (issueId === 'MALFORMED-123' && applicationType === 'stash' && dataType === 'pullrequest') {
              return res(
                ctx.status(200),
                ctx.json({
                  // Missing detail array
                  someOtherProperty: true,
                }),
              );
            }
            return res(ctx.status(404));
          },
        ),
      );

      const result = await jiraApi.getLinkedPullRequests('MALFORMED-123');
      expect(result).toEqual([]);
      
      // No error should be posted since this is not an error response
      // Just missing data which is handled gracefully
      const errors = errorApi.getErrors();
      expect(errors.length).toBe(0);
    });
    
    it('should handle errors gracefully without ErrorApi', async () => {
      // Create a JiraAPI instance without ErrorApi
      const jiraApiNoErrorApi = new JiraAPI({
        discoveryApi,
        configApi: mockApis.config(),
        fetchApi,
        // No errorApi provided
      });
      
      worker.resetHandlers();
      
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/dev-status/1.0/issue/detail',
          (req, res, ctx) => {
            const issueId = req.url.searchParams.get('issueId');
            const applicationType = req.url.searchParams.get('applicationType');
            const dataType = req.url.searchParams.get('dataType');
            
            if (issueId === 'ERROR-123' && applicationType === 'stash' && dataType === 'pullrequest') {
              return res(ctx.status(500), ctx.json({ error: 'Server error' }));
            }
            return res(ctx.status(404));
          },
        ),
      );
      
      // This should not throw an error, just return an empty array
      const result = await jiraApiNoErrorApi.getLinkedPullRequests('NO-ERROR-API-123');
      expect(result).toEqual([]);
    });
  });
  
  describe('getProjectDetails', () => {
    const jiraApi = new JiraAPI({
      discoveryApi,
      configApi: mockApis.config(),
      fetchApi,
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    it('should return project details and issues', async () => {
      // Mock the project response
      const mockProject = {
        id: 'TEST',
        key: 'TEST',
        name: 'Test Project',
        self: 'http://example.com/jira/rest/api/latest/project/TEST',
        avatarUrls: {
          '48x48': 'http://example.com/avatar.png',
        },
        projectTypeKey: 'software',
        issueTypes: [
          {
            id: '1',
            name: 'Bug',
            iconUrl: 'http://example.com/bug-icon.png',
          },
          {
            id: '2',
            name: 'Task',
            iconUrl: 'http://example.com/task-icon.png',
          },
          {
            id: '3',
            name: 'Sub-task',
            iconUrl: 'http://example.com/subtask-icon.png',
          }
        ],
      };
      
      // Mock issues response
      const mockFoundIssues = [
        {
          id: '10001',
          key: 'TEST-1',
          fields: {
            summary: 'Bug issue',
            issuetype: {
              name: 'Bug',
            },
            assignee: {
              displayName: 'User 1',
              avatarUrls: { '48x48': 'http://example.com/user1.png' },
            },
            status: { name: 'In Progress' },
            priority: { name: 'High', iconUrl: 'http://example.com/high.png' },
            created: '2025-08-01T10:00:00.000Z',
            updated: '2025-08-05T15:00:00.000Z',
          },
        },
        {
          id: '10002',
          key: 'TEST-2',
          fields: {
            summary: 'Task issue',
            issuetype: {
              name: 'Task',
            },
            assignee: {
              displayName: 'User 2',
              avatarUrls: { '48x48': 'http://example.com/user2.png' },
            },
            status: { name: 'To Do' },
            priority: { name: 'Medium', iconUrl: 'http://example.com/medium.png' },
            created: '2025-08-02T09:00:00.000Z',
            updated: '2025-08-03T14:00:00.000Z',
          },
        },
      ];
      
      // Set up MSW handler for the project API endpoint
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/api/latest/project/TEST',
          (_, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json(mockProject)
            );
          },
        ),
      );
      
      // Mock the getIssuesPaged method
      const getIssuesPagedSpy = jest
        .spyOn(jiraApi as any, 'getIssuesPaged')
        .mockResolvedValue(mockFoundIssues);
      
      // Execute the test
      const result = await jiraApi.getProjectDetails(
        'TEST',
        'frontend',
        'ui',
        ['In Progress', 'To Do'],
      );
      
      // Verify the result structure
      expect(result).toHaveProperty('project');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('ticketIds');
      expect(result).toHaveProperty('tickets');
      
      // Verify project details
      expect(result.project).toEqual({
        name: 'Test Project',
        iconUrl: 'http://example.com/avatar.png',
        type: 'software',
        url: expect.any(String),
      });
      
      // Verify issue counters - should not include Sub-task
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0]).toEqual({
        name: 'Bug',
        iconUrl: 'http://example.com/bug-icon.png',
        total: 1,
      });
      
      // Verify ticket IDs
      expect(result.ticketIds).toEqual(['TEST-1', 'TEST-2']);
      
      // Verify tickets structure
      expect(result.tickets).toHaveLength(2);
      expect(result.tickets[0]).toEqual({
        key: 'TEST-1',
        summary: 'Bug issue',
        assignee: {
          displayName: 'User 1',
          avatarUrl: 'http://example.com/user1.png',
        },
        status: 'In Progress',
        priority: { name: 'High', iconUrl: 'http://example.com/high.png' },
        created: '2025-08-01T10:00:00.000Z',
        updated: '2025-08-05T15:00:00.000Z',
      });
      
      // Verify method calls
      expect(getIssuesPagedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          projectKey: 'TEST',
          component: 'frontend',
          label: 'ui',
          statusesNames: ['In Progress', 'To Do'],
        }),
      );
    });
    
    it('should handle errors when fetching project details', async () => {
      // Set up MSW handler to simulate a 404 error
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/rest/api/latest/project/INVALID',
          (_, res, ctx) => {
            return res(
              ctx.status(404),
              ctx.json({ error: 'Project Not Found' })
            );
          },
        ),
      );
      
      // Verify that the API throws an error
      await expect(
        jiraApi.getProjectDetails('INVALID', 'component', 'label', [])
      ).rejects.toThrow('failed to fetch data');
    });
  });
  
  describe('getActivityStream', () => {
    const jiraApi = new JiraAPI({
      discoveryApi,
      configApi: mockApis.config(),
      fetchApi,
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    it('should return activity stream for a project', async () => {
      const mockActivityStreamResponse = '<feed>Activity stream data</feed>';
      
      // Set up MSW handler for the activity stream endpoint
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/activity',
          (req, res, ctx) => {
            const maxResults = req.url.searchParams.get('maxResults');
            const streamsParams = req.url.searchParams.getAll('streams');
            
            // Verify request parameters
            expect(maxResults).toBe('10');
            expect(streamsParams).toContain('key IS TEST');
            expect(streamsParams).toContain('issue-key IS TEST-1 TEST-2');
            
            return res(
              ctx.status(200),
              ctx.text(mockActivityStreamResponse)
            );
          },
        ),
      );
      
      // Execute the test
      const result = await jiraApi.getActivityStream(
        10,
        'TEST',
        'frontend',
        ['TEST-1', 'TEST-2'],
        'ui',
        false,
      );
      
      // Verify result
      expect(result).toBe(mockActivityStreamResponse);
    });
    
    it('should use bearer auth when requested', async () => {
      const mockActivityStreamResponse = '<feed>Activity stream data with bearer auth</feed>';
      
      // Set up MSW handler to check bearer auth
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/activity',
          (req, res, ctx) => {
            const url = req.url.toString();
            // Verify this doesn't contain os_authType=basic for bearer auth
            expect(url).not.toContain('os_authType=basic');
            
            return res(
              ctx.status(200),
              ctx.text(mockActivityStreamResponse)
            );
          },
        ),
      );
      
      // Execute the test with bearer auth
      const result = await jiraApi.getActivityStream(
        5,
        'TEST',
        undefined,
        undefined,
        undefined,
        true, // use bearer auth
      );
      
      // Verify result
      expect(result).toBe(mockActivityStreamResponse);
    });
    
    it('should handle errors when fetching activity stream', async () => {
      // Set up MSW handler to simulate a server error for this specific test
      worker.resetHandlers();
      worker.use(
        rest.get(
          'http://example.com/api/proxy/jira/api/activity',
          (_, res, ctx) => {
            // Return error status regardless of parameters for this test
            return res(
              ctx.status(500),
              ctx.text('Internal Server Error')
            );
          },
        ),
      );
      
      // Verify that the API throws an error
      await expect(
        jiraApi.getActivityStream(10, 'ERROR', undefined, undefined, undefined, false)
      ).rejects.toThrow('failed to fetch data');
      
      // Reset handlers for other tests - no need to add any specific handlers
      // as registerMswTestHooks() resets the handlers between tests
      worker.resetHandlers();
    });
  });
});
