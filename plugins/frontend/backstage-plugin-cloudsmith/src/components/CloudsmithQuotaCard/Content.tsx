/*
 * Copyright 2022 Larder Software Limited
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

import React from 'react';
import { CloudsmithQuotaCardContentProps } from './types';
import { CloudsmithApi, CloudsmithClient } from '../../api';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ErrorPanel, Progress, Gauge } from '@backstage/core-components';
import { Card, CardHeader, Avatar, Grid, Typography } from '@material-ui/core';

/**
 * A component to render the stats about a cloudsmith usage quota.
 *
 * @public
 */
export const Content = ({ owner }: CloudsmithQuotaCardContentProps) => {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const cloudsmithApi: CloudsmithApi = new CloudsmithClient({
    fetchApi,
    discoveryApi,
  });

  const {
    value: quotaStats,
    loading,
    error,
  } = useAsync(async () => {
    return await cloudsmithApi.getQuota({ owner });
  });

  if (loading) {
    return <Progress />;
  }

  if (error || !quotaStats) {
    return (
      <ErrorPanel error={error || new Error('quotaStats were not found')} />
    );
  }

  function calculatePercentage(used: number, limit: number) {
    return (used / limit) * 100;
  }

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={
          <Avatar
            aria-label="cloudsmith"
            src="https://cloudsmith.com/img/cloudsmith-mini-dark.svg"
          />
        }
        title="Cloudsmith Quota"
        subheader={owner}
      />
      <Grid container>
        <Grid item>
          <Typography>Bandwidth</Typography>
          <Gauge
            value={calculatePercentage(
              quotaStats.usage.raw.bandwidth.used,
              quotaStats.usage.raw.bandwidth.configured,
            )}
          />
        </Grid>
        <Grid item>
          <Typography>Storage</Typography>
          <Gauge
            value={calculatePercentage(
              quotaStats.usage.raw.storage.used,
              quotaStats.usage.raw.storage.configured,
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
};
