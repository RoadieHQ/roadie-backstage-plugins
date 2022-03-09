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

import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { buildKiteApiRef } from '../api';
import { BuildkiteBuildInfo } from './types';
import { generateRequestUrl } from './utils';

export const transform = (
  buildsData: BuildkiteBuildInfo[],
  restartBuild: (requestUrl: string) => Promise<void>
): BuildkiteBuildInfo[] => {
  return buildsData.map((buildData) => {
    const tableBuildInfo: BuildkiteBuildInfo = {
      ...buildData,
      onRestartClick: () => {
        restartBuild(generateRequestUrl(buildData.url));
      },
    };
    return tableBuildInfo;
  });
};

export const useBuilds = ({ owner, repo }: { owner: string; repo: string }) => {
  const api = useApi(buildKiteApiRef);
  const errorApi = useApi(errorApiRef);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const { value, loading, retry } = useAsyncRetry(async () => {
    let builds = [];
    try {
      builds = await api.getBuilds(owner, repo, page + 1, pageSize);
    } catch (e:any) {
      errorApi.post(e);
    }
    if (page === 0) setTotal(builds?.[0].number);
    // eslint-disable-next-line
    const response = transform(builds ?? [], restartBuild) as any;
    return response;
  }, [page, pageSize]);

  const restartBuild = async (requestUrl: string) => {
    try {
      await api.restartBuild(requestUrl);
      retry();
      return;
    } catch (e:any) {
      errorApi.post(e);
      throw e;
    }
  };

  const projectName = `${owner}/${repo}`;

  return [
    {
      page,
      pageSize,
      loading: loading,
      builds: value as BuildkiteBuildInfo[],
      projectName,
      total,
    },
    {
      setPage,
      setPageSize,
      restartBuild,
      retry,
    },
  ] as const;
};
