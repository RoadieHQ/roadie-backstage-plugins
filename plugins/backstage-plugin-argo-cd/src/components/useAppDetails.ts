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
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
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

  const { loading, value, error, retry } = useAsyncRetry(async () => {
    try {
      if (appName) {
        return await api.getAppDetails({ url, appName });
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
