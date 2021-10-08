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
import { Entity } from '@backstage/catalog-model';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { Octokit } from '@octokit/rest';
import { OctokitResponse } from '@octokit/types';
import { useAsync } from 'react-use';
import { useProjectEntity } from './useProjectEntity';
import { useEntityGithubScmIntegration } from './useEntityGithubScmIntegration';

export const useProtectedBranches = (entity: Entity) => {
  const auth = useApi(githubAuthApiRef);
  const { baseUrl } = useEntityGithubScmIntegration(entity);
  const { owner, repo } = useProjectEntity(entity);
  const { value, loading, error } = useAsync(async (): Promise<any> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({ auth: token });

    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/branches',
      {
        baseUrl,
        owner,
        repo,
        protected: true,
      },
    );
    return response.data;
  }, [baseUrl]);

  return {
    branches: value,
    loading,
    error,
  };
};

export const useRepoLicence = (entity: Entity) => {
  const auth = useApi(githubAuthApiRef);
  const { baseUrl } = useEntityGithubScmIntegration(entity);
  const { owner, repo } = useProjectEntity(entity);
  const { value, loading, error } = useAsync(async (): Promise<any> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({ auth: token });

    let license: string = '';
    try {
      const response = (await octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          baseUrl,
          owner,
          repo,
          path: 'LICENSE',
        },
      )) as OctokitResponse<any>;
      license = atob(response.data.content)
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)[0];
    } catch (a) {
      license = 'No license file found';
    }
    return license;
  }, [baseUrl]);
  return {
    license: value,
    loading,
    error,
  };
};
