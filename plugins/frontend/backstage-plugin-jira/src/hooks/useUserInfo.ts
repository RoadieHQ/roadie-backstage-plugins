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

export const useUserInfo = (userId: string, options: { showLinkedPRs?: boolean } = {}) => {
  const api = useApi(jiraApiRef);
  const { showLinkedPRs = true } = options;
  
  const getUserDetails = useCallback(async () => {
    try {
      setTimeout(() => (document.activeElement as HTMLElement).blur(), 0);
      return await api.getUserDetails(userId, showLinkedPRs);
    } catch (err: any) {
      return handleError(err);
    }
  }, [api, userId, showLinkedPRs]);

  const [state, fetchUserInfo] = useAsyncFn(() => getUserDetails(), [userId]);

  useEffect(() => {
    fetchUserInfo();
  }, [userId, fetchUserInfo]);

  return {
    loading: state.loading,
    error: state.error,
    user: state?.value?.user,
    tickets: state?.value?.tickets,
    fetchUserInfo,
  };
};
