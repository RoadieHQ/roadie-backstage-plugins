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
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { GithubRepositoryData } from '../types';
import { githubPullRequestsApiRef } from '../api';
import { readGithubIntegrationConfigs } from '@backstage/integration';

export const useGithubRepositoryData = (url: string) => {
  const githubPullRequestsApi = useApi(githubPullRequestsApiRef);
  const configApi = useApi(configApiRef);

  // Find the correct integration config from the repository API URL.
  const configs = readGithubIntegrationConfigs(
    configApi.getOptionalConfigArray('integrations.github') ?? [],
  );
  const githubIntegrationConfig = configs.find(
    v => v.apiBaseUrl && url.startsWith(v.apiBaseUrl),
  );
  // If undefined, the getRepositoryData below will use the default GitHub API URL.
  const host = githubIntegrationConfig?.host;

  return useAsync(async (): Promise<GithubRepositoryData> => {
    return githubPullRequestsApi.getRepositoryData({
      url,
      hostname: host,
    });
  }, [githubPullRequestsApi, host]);
};
