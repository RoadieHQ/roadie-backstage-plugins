import {configApiRef, errorApiRef, useApi} from '@backstage/core-plugin-api';
import {useCallback, useEffect, useState} from 'react';
import {useAsyncRetry} from 'react-use';
import {travisCIApiRef, TravisCIBuildResponse} from '../api';
import {useTravisRepoData} from './useTravisRepoData';

export type Build = {
  id: string;
  buildName: string;
  onRestartClick: () => false | Promise<void>;
  finishedAt: string;
  duration: number;
  source: {
    branchName: string;
    commit: {
      hash: string;
      url: string;
    };
  };
  status: string;
  buildUrl: string;
};

const makeReadableStatus = (status: string | undefined) => {
  if (!status) return '';
  return (
    ({
      retried: 'Retried',
      canceled: 'Canceled',
      infrastructure_fail: 'Infra fail',
      timedout: 'Timedout',
      not_run: 'Not run',
      running: 'Running',
      failed: 'Failed',
      queued: 'Queued',
      scheduled: 'Scheduled',
      not_running: 'Not running',
      no_tests: 'No tests',
      fixed: 'Fixed',
      success: 'Success',
    } as Record<string, string>)[status] || status
  );
};

export const transform = (
  buildsData: TravisCIBuildResponse[],
  restartBuild: { (buildId: number): Promise<void> },
  projectName: string,
  baseUrl: string,
): Build[] => {
  return buildsData.map(buildData => ({
    id: buildData.number,
    buildName: buildData.commit.message,
    onRestartClick: () =>
        typeof buildData.id !== 'undefined' && restartBuild(buildData.id),
    source: {
      branchName: String(buildData.branch.name),
      commit: {
        hash: String(buildData.commit.sha),
        url: buildData.commit.compare_url,
      },
    },
    finishedAt: buildData.finished_at,
    duration: buildData.duration,
    status: makeReadableStatus(buildData.state),
    buildUrl: `${baseUrl}${projectName}${buildData['@href']}`,
  }));
};

export function useBuilds() {
  const repoSlug = useTravisRepoData();

  const api = useApi(travisCIApiRef);
  const errorApi = useApi(errorApiRef);
  const configApi = useApi(configApiRef);
  let baseUrl: string;
  try {
    baseUrl = configApi.getString('travisci.baseUrl');
  } catch (e:any) {
    baseUrl = 'https://travis-ci.com/';
  }

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const getBuilds = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      try {
        return await api.getBuilds({
          limit,
          offset,
          repoSlug,
        });
      } catch (e:any) {
        errorApi.post(e);
        return Promise.reject(e);
      }
    },
    [repoSlug, api, errorApi],
  );

  const restartBuild = async (buildId: number) => {
    try {
      await api.retry(buildId);
    } catch (e:any) {
      errorApi.post(e);
    }
  };

  useEffect(() => {
    getBuilds({ limit: 1, offset: 0 }).then(b => setTotal(b?.[0].build_num!));
  }, [repoSlug, getBuilds]);

  const { loading, value, retry } = useAsyncRetry(
    () =>
      getBuilds({
        offset: page * pageSize,
        limit: pageSize,
      }).then(builds =>
        transform(builds ?? [], restartBuild, repoSlug, baseUrl),
      ),
    [page, pageSize, getBuilds],
  );

  return [
    {
      page,
      pageSize,
      loading,
      value,
      projectName: repoSlug,
      total,
    },
    {
      getBuilds,
      setPage,
      setPageSize,
      restartBuild,
      retry,
    },
  ] as const;
}
