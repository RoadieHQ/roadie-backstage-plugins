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
import { configApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useAsyncRetry } from 'react-use';
import { argoCDApiRef } from '../api';

export const useAppDetails = ({
  appName,
  appSelector,
  projectName,
  url,
}: {
  appName?: string;
  appSelector?: string;
  projectName?: string;
  url: string;
}) => {
  const api = useApi(argoCDApiRef);
  const errorApi = useApi(errorApiRef);
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);

  const { loading, value, error, retry } = useAsyncRetry(async () => {
    try {
      if (appName) {
        if (configApi.getBoolean('argocd.perCluster.enabled') !== true) {
          return await api.getAppDetails({ url, appName });
        }
        const kubeInfo = await api.kubernetesServiceLocator(
          appName as string,
          entity,
        );
        const promises = kubeInfo.map(async (cluster: string) => {
          const apiOut = await api.getAppDetails({ url, appName, cluster });
          if (!apiOut.metadata) {
            return {
              status: {
                history: [],
                sync: { status: 'Missing' },
                health: { status: 'Missing' },
                operationState: {},
              },
              metadata: { name: appName, cluster: cluster },
            };
          }
          apiOut.metadata.cluster = cluster;
          return apiOut;
        });
        const output = await Promise.all(promises);
        return output;
      }
      if (appSelector || projectName) {
        return await api.listApps({ url, appSelector, projectName });
      }
      return Promise.reject('Neither appName nor appSelector provided');
    } catch (e) {
      errorApi.post(e);
      return Promise.reject(e);
    }
  });

  return {
    loading,
    value,
    error,
    retry,
  };
};
