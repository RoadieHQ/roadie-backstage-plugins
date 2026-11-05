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
import { createMockDirectory } from '@backstage/backend-test-utils';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { createGitlabRepoCommitAction } from './repoCommit';

describe('gitlab:repo:commit', () => {
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({
      integrations: {
        gitlab: [{ host: 'gitlab.com', token: 'integration-token' }],
      },
    }),
  );

  const action = createGitlabRepoCommitAction({ integrations });
  const repoUrl = 'gitlab.com?repo=my-project&owner=my-group';
  const projectUrl = 'https://gitlab.com/api/v4/projects/my-group%2Fmy-project';
  const commitsUrl = `${projectUrl}/repository/commits`;

  const mockDir = createMockDirectory();

  const jsonResponse = (status: number, body: unknown, statusText = '') =>
    new Response(JSON.stringify(body), { status, statusText });

  const commitResponse = () =>
    jsonResponse(201, {
      id: 'abc123',
      web_url: 'https://gitlab.com/my-group/my-project/-/commit/abc123',
    });

  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  const contextFor = (input: Record<string, unknown>) =>
    createMockActionContext({
      workspacePath: mockDir.path,
      input: {
        repoUrl,
        branch: 'main',
        commitMessage: 'initial commit',
        ...input,
      },
    });

  const requestBody = (call: number) =>
    JSON.parse(fetchMock.mock.calls[call][1].body);

  const requestHeaders = (call: number) =>
    fetchMock.mock.calls[call][1].headers;

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    mockDir.setContent({
      'catalog-info.yaml': 'kind: Component',
      src: { 'index.ts': 'export {};' },
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('commits every workspace file as a base64 create action', async () => {
    fetchMock.mockResolvedValue(commitResponse());

    const ctx = contextFor({});
    await action.handler(ctx);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(commitsUrl);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(requestHeaders(0)['PRIVATE-TOKEN']).toBe('integration-token');

    const body = requestBody(0);
    expect(body.branch).toBe('main');
    expect(body.commit_message).toBe('initial commit');
    expect(body.start_branch).toBeUndefined();
    expect(body.actions).toEqual(
      expect.arrayContaining([
        {
          action: 'create',
          file_path: 'catalog-info.yaml',
          encoding: 'base64',
          content: Buffer.from('kind: Component').toString('base64'),
        },
        {
          action: 'create',
          file_path: 'src/index.ts',
          encoding: 'base64',
          content: Buffer.from('export {};').toString('base64'),
        },
      ]),
    );
    expect(body.actions).toHaveLength(2);

    expect(ctx.output).toHaveBeenCalledWith('commitHash', 'abc123');
    expect(ctx.output).toHaveBeenCalledWith(
      'commitUrl',
      'https://gitlab.com/my-group/my-project/-/commit/abc123',
    );
    expect(ctx.output).toHaveBeenCalledWith('projectId', 'my-group/my-project');
    expect(ctx.output).toHaveBeenCalledWith('branch', 'main');
  });

  it('takes the files from sourcePath and writes them under targetPath', async () => {
    fetchMock.mockResolvedValue(commitResponse());

    await action.handler(contextFor({ sourcePath: 'src', targetPath: 'app' }));

    const body = requestBody(0);
    expect(body.actions).toEqual([
      {
        action: 'create',
        file_path: 'app/index.ts',
        encoding: 'base64',
        content: Buffer.from('export {};').toString('base64'),
      },
    ]);
  });

  it('passes start_branch through when given', async () => {
    fetchMock.mockResolvedValue(commitResponse());

    await action.handler(contextFor({ startBranch: 'develop' }));

    expect(requestBody(0).start_branch).toBe('develop');
  });

  it('sends a supplied token as a bearer token', async () => {
    fetchMock.mockResolvedValue(commitResponse());

    await action.handler(contextFor({ token: 'user-token' }));

    expect(requestHeaders(0).Authorization).toBe('Bearer user-token');
    expect(requestHeaders(0)['PRIVATE-TOKEN']).toBeUndefined();
  });

  it('honours an explicit tokenType', async () => {
    fetchMock.mockResolvedValue(commitResponse());

    await action.handler(
      contextFor({ token: 'user-token', tokenType: 'private' }),
    );

    expect(requestHeaders(0)['PRIVATE-TOKEN']).toBe('user-token');
    expect(requestHeaders(0).Authorization).toBeUndefined();
  });

  it('points the default branch at the committed branch when asked', async () => {
    fetchMock
      .mockResolvedValueOnce(commitResponse())
      .mockResolvedValueOnce(jsonResponse(200, { default_branch: 'main' }));

    await action.handler(contextFor({ setDefaultBranch: true }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(projectUrl);
    expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
    expect(requestBody(1)).toEqual({ default_branch: 'main' });
  });

  it('reports a failure to set the default branch after a successful commit', async () => {
    fetchMock
      .mockResolvedValueOnce(commitResponse())
      .mockResolvedValueOnce(
        new Response('nope', { status: 403, statusText: 'Forbidden' }),
      );

    await expect(
      action.handler(contextFor({ setDefaultBranch: true })),
    ).rejects.toThrow(/Committed to main but failed to set it as the default/);
  });

  it('fails when the workspace has no files', async () => {
    mockDir.setContent({});

    await expect(action.handler(contextFor({}))).rejects.toThrow(
      /No files found under the workspace to commit/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('surfaces the GitLab response when the commit fails', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"message":"A file with this name already exists"}', {
        status: 400,
        statusText: 'Bad Request',
      }),
    );

    await expect(action.handler(contextFor({}))).rejects.toThrow(
      /400 Bad Request: \{"message":"A file with this name already exists"\}/,
    );
  });

  it('fails on an unexpected commit payload', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { sha: 'abc123' }));

    await expect(action.handler(contextFor({}))).rejects.toThrow(
      /unexpected commit payload/,
    );
  });
});
