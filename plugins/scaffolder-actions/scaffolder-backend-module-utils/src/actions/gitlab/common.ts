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
import { InputError } from '@backstage/errors';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { parseRepoUrl } from '@backstage/plugin-scaffolder-node';

export type GitlabTokenType = 'oauth' | 'private';

export type GitlabApiTarget = {
  projectId: string;
  apiBase: string;
  headers: Record<string, string>;
};

export const resolveGitlabApiTarget = (options: {
  repoUrl: string;
  integrations: ScmIntegrationRegistry;
  token?: string;
  tokenType?: GitlabTokenType;
}): GitlabApiTarget => {
  const { repoUrl, integrations } = options;
  const { host, owner, repo, project } = parseRepoUrl(repoUrl, integrations);

  const integrationConfig = integrations.gitlab.byHost(host);
  if (!integrationConfig) {
    throw new InputError(
      `No matching integration configuration for host ${host}, please check your integrations config`,
    );
  }

  const token = options.token ?? integrationConfig.config.token;
  if (!token) {
    throw new InputError(`No token available for host ${host}`);
  }

  const tokenType = options.tokenType ?? (options.token ? 'oauth' : 'private');
  const projectId = project ? project : `${owner}/${repo}`;

  return {
    projectId,
    apiBase: `${
      integrationConfig.config.apiBaseUrl
    }/projects/${encodeURIComponent(projectId)}`,
    headers: {
      ...(tokenType === 'oauth'
        ? { Authorization: `Bearer ${token}` }
        : { 'PRIVATE-TOKEN': token }),
      'Content-Type': 'application/json',
    },
  };
};

export const describeFailure = async (response: Response): Promise<string> => {
  const body = await response.text().catch(() => '');
  return `${response.status} ${response.statusText}${body ? `: ${body}` : ''}`;
};
