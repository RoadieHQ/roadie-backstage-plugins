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
import { githubAuthApiRef, useApi } from '@backstage/core-plugin-api';

export const useGithubRepository = ({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) => {
  const auth = useApi(githubAuthApiRef);
  const { value, loading, error } = useAsync(
    async (): Promise<boolean> => {
      const token = await auth.getAccessToken(['repo'], { optional: true });
      const octokit = new Octokit({ auth: token });
      const githubRepositoryResponse = await octokit.rest.repos.get({
        owner,
        repo,
      });
      return githubRepositoryResponse.data.private;
    },
  );
  return {
    value,
    loading,
    error,
  };
};
