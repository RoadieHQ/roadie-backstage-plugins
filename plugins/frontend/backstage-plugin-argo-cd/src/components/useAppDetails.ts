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

import { configApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useAsyncRetry } from 'react-use';
import { argoCDApiRef } from '../api';

export const useAppDetails = ({
  appName,
  appSelector,
  appNamespace,
  projectName,
  url,
}: {
  appName?: string;
  appSelector?: string;
  appNamespace?: string;
  projectName?: string;
  url: string;
}) => {
  const api = useApi(argoCDApiRef);
  const errorApi = useApi(errorApiRef);
  const configApi = useApi(configApiRef);

  const { loading, value, error, retry } = useAsyncRetry(async () => {
    const argoSearchMethod: boolean = Boolean(
      configApi.getOptionalConfigArray('argocd.appLocatorMethods')?.length,
    );
    try {
      if (!argoSearchMethod && appName) {
        return api.getAppDetails({ url, appName, appNamespace });
      }
      if (argoSearchMethod && appName) {
        const kubeInfo = await api.serviceLocatorUrl({
          appName: appName as string,
          appNamespace: appNamespace,
        });
        if (kubeInfo instanceof Error) return kubeInfo;
        const promises = kubeInfo.map(async (instance: any) => {
          const apiOut = await api.getAppDetails({
            url,
            appName,
            appNamespace,
            instance: instance.name,
          });
          if (!apiOut.metadata) {
            return {
              status: {
                history: [],
                sync: { status: 'Missing' },
                health: { status: 'Missing' },
                operationState: {},
              },
              metadata: { name: appName, instance: instance.name },
            };
          }
          apiOut.metadata.instance = instance;
          return apiOut;
        });
        return Promise.all(promises);
      }
      if (argoSearchMethod && appSelector) {
        const kubeInfo = await api.serviceLocatorUrl({
          appSelector: appSelector as string,
          appNamespace,
        });
        if (kubeInfo instanceof Error) return kubeInfo;
        const promises = kubeInfo.map(async (instance: any) => {
          return api.getAppListDetails({
            url,
            appSelector,
            appNamespace,
            instance: instance.name,
          });
        });
        const output = await Promise.all(promises);
        return {
          items: output
            .flatMap(argoCdAppList => argoCdAppList.items)
            .filter(item => item !== null),
        };
      }
      if (appSelector || projectName) {
        return api.listApps({
          url,
          appSelector,
          appNamespace,
          projectName,
        });
      }
      return Promise.reject('Neither appName nor appSelector provided');
    } catch (e: any) {
      errorApi.post(new Error('Something went wrong'));
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
