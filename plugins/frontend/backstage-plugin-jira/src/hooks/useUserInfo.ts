import { useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useAsyncFn } from 'react-use';
import { handleError } from './utils';
import { jiraApiRef } from '../api';

export const useUserInfo = (userId: string) => {
  const api = useApi(jiraApiRef);
  const getUserDetails = useCallback(async () => {
    try {
      setTimeout(() => (document.activeElement as HTMLElement).blur(), 0);
      return await api.getUserDetails(userId);
    } catch (err: any) {
      return handleError(err);
    }
  }, [api, userId]);

  const [state, fetchUserInfo] = useAsyncFn(
    () => getUserDetails(),
    [userId],
  );

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
