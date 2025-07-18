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

import { CloudsmithQuotaCardContentProps } from './types';
import { CloudsmithApi, CloudsmithClient } from '../../api';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { Card, CardHeader, Avatar, Grid } from '@material-ui/core';
import { UsageGauge } from './UsageGauge';

/**
 * A component to render audit log data for a Cloudsmith repository.
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

  const { bandwidth, storage } = quotaStats.usage.raw;

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
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <UsageGauge
            title="Package Delivery"
            used={bandwidth.used}
            configured={bandwidth.configured}
            planLimit={bandwidth.plan_limit}
          />
        </Grid>
        <Grid item xs={6}>
          <UsageGauge
            title="Artifact Data"
            used={storage.used}
            configured={storage.configured}
            planLimit={storage.plan_limit}
          />
        </Grid>
      </Grid>
    </Card>
  );
};
