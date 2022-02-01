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
import { useEffect } from 'react';
import { useGithubInsights } from '../components/GithubInsightsContext';
import { RequestError } from "@octokit/request-error";

export const useProtectedBranches = (entity: Entity) => {
  const auth = useApi(githubAuthApiRef);
  const { baseUrl } = useEntityGithubScmIntegration(entity);
  const { owner, repo } = useProjectEntity(entity);

  const { repoBranches } = useGithubInsights()
  const [branches, setBranches] = repoBranches

  const { value, loading, error } = useAsync(async (): Promise<any> => {
    let result;
    try {
      const token = await auth.getAccessToken(['repo']);
      const octokit = new Octokit({ auth: token });

      const response = await octokit.request(
        'GET /repos/{owner}/{repo}/branches',
        {
          headers: {
            "if-none-match": branches.etag
          },
          baseUrl,
          owner,
          repo,
          protected: true,
        },
      );

      result = { data: response.data, etag: response.headers.etag ?? "" };

    } catch (e) {
      if (e instanceof RequestError) {
        if (e.status === 304) {
          result = branches
        }
      }
    }
    return result
  }, [baseUrl]);

  useEffect(() => {
    if (value) {
      setBranches({ ...value })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

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

  const { repoLicense } = useGithubInsights()
  const [licence, setLicense] = repoLicense

  const { value, loading, error } = useAsync(async (): Promise<any> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({ auth: token });

    let result;
    try {
      const response = (await octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          headers: {
            "if-none-match": licence.etag
          },
          baseUrl,
          owner,
          repo,
          path: 'LICENSE',
        },
      )) as OctokitResponse<any>;

      const license = atob(response.data.content)
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)[0];
      result = { etag: response.headers.etag ?? "", data: license }
    } catch (e) {
      if (e instanceof RequestError) {
        if (e.status === 304) {
          return licence
        } else if (e.status === 404) {
          const license = 'No license file found';
          result = { etag: "", data: license }
        }
      }
    }
    return result
  }, [baseUrl]);

  useEffect(() => {
    if (value) {
      setLicense({ ...value })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return {
    license: value,
    loading,
    error,
  };
};
