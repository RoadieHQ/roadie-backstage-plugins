/*
 * Copyright 2020 RoadieHQ
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
import { useAsync } from 'react-use';
import { Octokit } from '@octokit/rest';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { useEntityGithubScmIntegration } from './useEntityGithubScmIntegration';
import { ContributorData } from '../components/types';

export const useContributor = (username: string) => {
  const auth = useApi(githubAuthApiRef);
  const { baseUrl } = useEntityGithubScmIntegration();

  const { value, loading, error } = useAsync(async (): Promise<
    ContributorData
  > => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({ auth: token });

    const response = await octokit.request(`GET /users/${username}`, {
      baseUrl,
    });
    const data = response.data;
    return data;
  }, [username]);

  return {
    contributor: value,
    loading,
    error,
  };
};
