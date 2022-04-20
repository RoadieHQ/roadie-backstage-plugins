import { AsyncState } from 'react-use/lib/useAsyncFn';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

export const useWhosOut = (
  start_time?: string,
  end_time?: string,
): AsyncState<any> => {
  const discoveryApi = useApi(discoveryApiRef);
  const { loading, error, value } = useAsync(async () => {
    const proxyUrl = await discoveryApi.getBaseUrl('proxy');
    let query = '';

    if (start_time) {
      query += `start=${start_time}`;
    }

    if (end_time) {
      if (start_time) {
        query += `&end=${end_time}`;
      } else {
        query += `?end=${start_time}`;
      }
    }
    const resp = await fetch(
      `${proxyUrl}/bamboohr/api/time_off/whos_out/${query}`,
    );
    return await resp.json();
  }, [discoveryApi]);

  return {
    loading,
    error,
    value: value,
  };
};
