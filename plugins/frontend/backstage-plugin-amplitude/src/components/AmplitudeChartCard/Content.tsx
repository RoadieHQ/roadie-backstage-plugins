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
import { AmplitudeChartCardContentProps } from './types';
import { AmplitudeApi, AmplitudeClient } from '../../api';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ErrorPanel, Progress, TrendLine } from '@backstage/core-components';
import { Card, CardHeader, Grid } from '@material-ui/core';

/**
 * A component to render the stats about a amplitude chart.
 *
 * @public
 */
export const Content = ({ chartId, title }: AmplitudeChartCardContentProps) => {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const amplitudeApi: AmplitudeApi = new AmplitudeClient({
    fetchApi,
    discoveryApi,
  });

  const {
    value: chartData,
    loading,
    error,
  } = useAsync(async () => {
    return await amplitudeApi.getChart({ chartId });
  });

  if (loading) {
    return <Progress />;
  }

  if (error || !chartData) {
    return <ErrorPanel error={error || new Error('chartId was not found')} />;
  }

  return (
    <Card variant="outlined">
      <CardHeader title={title || 'Amplitude'} />
      <Grid container>
        <Grid item>
          {chartData.data.series.map((data, index) => {
            return (
              <TrendLine data={data} title={chartData.data.seriesMeta[index]} />
            );
          })}
        </Grid>
      </Grid>
    </Card>
  );
};
