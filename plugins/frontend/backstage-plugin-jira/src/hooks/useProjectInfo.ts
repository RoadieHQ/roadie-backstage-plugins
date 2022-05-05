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

import { useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useAsyncFn } from 'react-use';
import { handleError } from './utils';
import { jiraApiRef } from '../api';

export const useProjectInfo = (
  projectKey: string,
  component: string,
  statusesNames: Array<string>,
) => {
  const api = useApi(jiraApiRef);

  const getProjectDetails = useCallback(async () => {
    try {
      setTimeout(() => (document.activeElement as HTMLElement).blur(), 0);
      return await api.getProjectDetails(projectKey, component, statusesNames);
    } catch (err:any) {
      return handleError(err);
    }
  }, [api, projectKey, component, statusesNames]);

  const [state, fetchProjectInfo] = useAsyncFn(() => getProjectDetails(), [
    statusesNames,
  ]);

  useEffect(() => {
    fetchProjectInfo();
  }, [statusesNames, fetchProjectInfo]);

  return {
    projectLoading: state.loading,
    project: state?.value?.project,
    issues: state?.value?.issues,
    ticketIds: state?.value?.ticketIds,
    projectError: state.error,
    fetchProjectInfo,
  };
};
