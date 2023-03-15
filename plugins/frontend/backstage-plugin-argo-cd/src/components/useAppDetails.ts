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
import { ArgoCDApi, argoCDApiRef } from '../api';

const getCompleteAppDetails = async ({
  api,
  appName,
  url,
}: {
  api: ArgoCDApi;
  appName: string;
  url: string;
}) => {
  const appDetails = await api.getAppDetails({ url, appName });
  const appResources = await api.getAppManagedResources({ url, appName });

  const uniqueLabels = appResources.items
    .map((item) => JSON.parse(item.liveState).metadata.labels)
    .reduce((acc, current) => {
      Object.keys(current).forEach((key) => {
        if (!acc.hasOwnProperty(key)) {
          acc[key] = current[key];
        }
      });
      return acc;
    }, {});

  appDetails.resources = { labels: uniqueLabels };
  return appDetails;
};

const getCompleteAppList = async ({
  api,
  appSelector,
  projectName,
  url,
}: {
  api: ArgoCDApi;
  appSelector?: string;
  projectName?: string;
  url: string;
}) => {
  const appList = await api.listApps({ url, appSelector, projectName });
  appList.items = await Promise.all((appList.items ?? []).map(async (item) => {
    const appName = item.metadata.name;
    return await getCompleteAppDetails({ api, appName, url });
  }));
  return appList;
};

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
  const configApi = useApi(configApiRef);

  const { loading, value, error, retry } = useAsyncRetry(async () => {
    const argoSearchMethod: boolean = Boolean(
      configApi.getOptionalConfigArray('argocd.appLocatorMethods')?.length,
    );
    try {
      if (!argoSearchMethod && appName) {
        return await getCompleteAppDetails({ api, appName, url });
      }
      if (argoSearchMethod && appName) {
        const kubeInfo = await api.serviceLocatorUrl({
          appName: appName as string,
        });
        if (kubeInfo instanceof Error) return kubeInfo;
        const promises = kubeInfo.map(async (instance: any) => {
          const apiOut = await api.getAppDetails({
            url,
            appName,
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
        return await Promise.all(promises);
      }
      if (argoSearchMethod && appSelector) {
        const kubeInfo = await api.serviceLocatorUrl({
          appSelector: appSelector as string,
        });
        if (kubeInfo instanceof Error) return kubeInfo;
        const promises = kubeInfo.map(async (instance: any) => {
          const apiOut = await api.getAppListDetails({
            url,
            appSelector,
            instance: instance.name,
          });
          return apiOut;
        });
        const output = await Promise.all(promises);
        const items = {
          items: output
            .flatMap(argoCdAppList => argoCdAppList.items)
            .filter(item => item !== null),
        };
        return items;
      }
      if (appSelector || projectName) {
        return await getCompleteAppList({api, appSelector, projectName, url});
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
