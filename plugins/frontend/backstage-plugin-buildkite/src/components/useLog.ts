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

import { useCallback } from 'react';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useAsyncFn } from 'react-use';
import { buildKiteApiRef } from '../api';

export const useLog = (url: string) => {
  const api = useApi(buildKiteApiRef);
  const errorApi = useApi(errorApiRef);

  const getLogs = useCallback(async () => {
    try {
      const build = await api.getLog(
        url,
      );
      return Promise.resolve(build);
    } catch (e:any) {
      errorApi.post(e);
      return Promise.reject(e);
    }
  }, [url, api, errorApi]);
  
  const [state, fetchLogs] = useAsyncFn(() => getLogs(), [
    getLogs,
  ]);

  return { 
    value: state.value,
    error: state.error,
    fetchLogs
  };
}
