import { useCallback } from 'react';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { jiraApiRef } from '../api';
import { CustomQuery, IssuesCounter } from '../types';

export const useCustomQueriesCount = (queries: Array<CustomQuery>) => {
  const api = useApi(jiraApiRef);

  const getCustomQueriesCount = useCallback(async () => {
    const responses = await Promise.allSettled(
      queries.map(query => api.getIssuesCountByJql(query)),
    );

    return responses
      .filter(item => item.status === 'fulfilled')
      .map(item => (item as PromiseFulfilledResult<IssuesCounter>).value);
  }, [api, queries]);

  const { loading, value, error } = useAsync(() => getCustomQueriesCount(), []);
  return {
    customQueriesCountLoading: loading,
    customQueriesCount: value,
    customQueriesError: error,
  };
};
