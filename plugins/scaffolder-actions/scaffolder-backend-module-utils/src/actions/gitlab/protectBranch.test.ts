/*
 * Copyright 2026 Larder Software Limited
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
import { ConfigReader } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { createGitlabRepoProtectAction } from './protectBranch';

describe('gitlab:repo:protect', () => {
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({
      integrations: {
        gitlab: [{ host: 'gitlab.com', token: 'integration-token' }],
      },
    }),
  );

  const action = createGitlabRepoProtectAction({ integrations });
  const repoUrl = 'gitlab.com?repo=my-project&owner=my-group';
  const protectedBranchesUrl =
    'https://gitlab.com/api/v4/projects/my-group%2Fmy-project/protected_branches';

  const jsonResponse = (status: number, body: unknown, statusText = '') =>
    new Response(JSON.stringify(body), { status, statusText });

  const conflictResponse = () =>
    new Response('{"message":"Protected branch \'main\' already exists"}', {
      status: 409,
    });

  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const requestBody = (call: number) =>
    JSON.parse(fetchMock.mock.calls[call][1].body);

  const requestHeaders = (call: number) =>
    fetchMock.mock.calls[call][1].headers;

  it('protects the branch with the GitLab defaults and the integration token', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: 42, name: 'main' }));

    const ctx = createMockActionContext({ input: { repoUrl, branch: 'main' } });
    await action.handler(ctx);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(protectedBranchesUrl);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(requestHeaders(0)['PRIVATE-TOKEN']).toBe('integration-token');
    expect(requestBody(0)).toEqual({
      name: 'main',
      push_access_level: 40,
      merge_access_level: 40,
    });

    expect(ctx.output).toHaveBeenCalledWith('projectId', 'my-group/my-project');
    expect(ctx.output).toHaveBeenCalledWith('branch', 'main');
    expect(ctx.output).toHaveBeenCalledWith('protectedBranchId', 42);
  });

  it('maps the role names onto GitLab access levels', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: 1, name: 'main' }));

    await action.handler(
      createMockActionContext({
        input: {
          repoUrl,
          branch: 'main',
          allowedToPush: 'no one',
          allowedToMerge: 'developer',
          allowedToUnprotect: 'admin',
        },
      }),
    );

    expect(requestBody(0)).toEqual({
      name: 'main',
      push_access_level: 0,
      merge_access_level: 30,
      unprotect_access_level: 60,
    });
  });

  it('sends a supplied token as a bearer token', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: 1, name: 'main' }));

    await action.handler(
      createMockActionContext({
        input: { repoUrl, branch: 'main', token: 'user-token' },
      }),
    );

    expect(requestHeaders(0).Authorization).toBe('Bearer user-token');
    expect(requestHeaders(0)['PRIVATE-TOKEN']).toBeUndefined();
  });

  it('sends the optional flags only when they are set', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: 1, name: 'main' }));

    await action.handler(
      createMockActionContext({
        input: {
          repoUrl,
          branch: 'main',
          allowForcePush: false,
          codeOwnerApprovalRequired: true,
        },
      }),
    );

    expect(requestBody(0)).toMatchObject({
      allow_force_push: false,
      code_owner_approval_required: true,
    });
  });

  it('protects a wildcard branch', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, { id: 7, name: 'release/*' }),
    );

    await action.handler(
      createMockActionContext({ input: { repoUrl, branch: 'release/*' } }),
    );

    expect(requestBody(0).name).toBe('release/*');
  });

  it('replaces the rule GitLab created for the default branch', async () => {
    fetchMock
      .mockResolvedValueOnce(conflictResponse())
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse(201, { id: 9, name: 'main' }));

    const ctx = createMockActionContext({ input: { repoUrl, branch: 'main' } });
    await action.handler(ctx);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(fetchMock.mock.calls[1][0]).toBe(`${protectedBranchesUrl}/main`);
    expect(fetchMock.mock.calls[1][1].method).toBe('DELETE');
    expect(fetchMock.mock.calls[2][1].method).toBe('POST');
    expect(requestBody(2)).toEqual(requestBody(0));

    expect(ctx.output).toHaveBeenCalledWith('protectedBranchId', 9);
  });

  it('treats a rule that disappears before the delete as nothing to replace', async () => {
    fetchMock
      .mockResolvedValueOnce(conflictResponse())
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(jsonResponse(201, { id: 9, name: 'main' }));

    const ctx = createMockActionContext({ input: { repoUrl, branch: 'main' } });

    await expect(action.handler(ctx)).resolves.toBeUndefined();
    expect(ctx.output).toHaveBeenCalledWith('protectedBranchId', 9);
  });

  it('fails when the existing rule cannot be removed', async () => {
    fetchMock
      .mockResolvedValueOnce(conflictResponse())
      .mockResolvedValueOnce(new Response('forbidden', { status: 403 }));

    await expect(
      action.handler(
        createMockActionContext({ input: { repoUrl, branch: 'main' } }),
      ),
    ).rejects.toThrow(/Failed to remove the existing protection of main/);
  });

  it('leaves the existing rule alone when replaceExisting is false', async () => {
    fetchMock.mockResolvedValueOnce(conflictResponse());

    await expect(
      action.handler(
        createMockActionContext({
          input: { repoUrl, branch: 'main', replaceExisting: false },
        }),
      ),
    ).rejects.toThrow(/already protected.*replaceExisting/s);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('surfaces the GitLab response when the request fails', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"message":"invalid"}', {
        status: 400,
        statusText: 'Bad Request',
      }),
    );

    await expect(
      action.handler(
        createMockActionContext({ input: { repoUrl, branch: 'main' } }),
      ),
    ).rejects.toThrow(/400 Bad Request: \{"message":"invalid"\}/);
  });

  it('fails on an unexpected payload', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { name: 'main' }));

    await expect(
      action.handler(
        createMockActionContext({ input: { repoUrl, branch: 'main' } }),
      ),
    ).rejects.toThrow(/unexpected protected branch payload/);
  });

  it('fails when there is no token for the host', async () => {
    const tokenlessAction = createGitlabRepoProtectAction({
      integrations: ScmIntegrations.fromConfig(
        new ConfigReader({
          integrations: { gitlab: [{ host: 'gitlab.com' }] },
        }),
      ),
    });

    await expect(
      tokenlessAction.handler(
        createMockActionContext({ input: { repoUrl, branch: 'main' } }),
      ),
    ).rejects.toThrow(/No token available for host gitlab.com/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
