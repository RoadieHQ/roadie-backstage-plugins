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
import { useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';
import { create } from 'zustand';

interface LoginState {
  statusMap: Map<string, boolean>;
  getStatus: (hash: string) => boolean;
}

const useGitHubLoginStatusStore = create<LoginState>((_set, getState) => ({
  statusMap: new Map<string, boolean>(),
  getStatus: (hash: string) => {
    return getState().statusMap.has(hash)
      ? getState().statusMap.get(hash)!
      : false;
  },
}));

export const useGithubLoggedIn = (
  hostname: string = 'github.com',
  scope: string[] = ['repo'],
) => {
  const { getStatus } = useGitHubLoginStatusStore();
  const scmAuth = useApi(scmAuthApiRef);
  const url = `https://${hostname}`;
  const hash = url + scope.toString();

  useEffect(() => {
    const doLogin = async () => {
      const credentials = await scmAuth.getCredentials({
        additionalScope: {
          customScopes: { github: scope },
        },
        url: url,
        optional: true,
      });

      if (credentials?.token) {
        useGitHubLoginStatusStore.setState(prev => ({
          ...prev,
          statusMap: new Map(prev.statusMap).set(hash, true),
        }));
      }
    };

    doLogin();
  }, [hostname, scmAuth, useGitHubLoginStatusStore]);

  return {
    isLoggedIn: getStatus(hash),
    addLoginStatus: () =>
      useGitHubLoginStatusStore.setState(prev => ({
        ...prev,
        statusMap: new Map(prev.statusMap).set(hash, true),
      })),
  };
};
