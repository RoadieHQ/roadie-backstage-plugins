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

import React from 'react';
import { BugsnagError } from '../../api/types';
import { TrendLine } from '@backstage/core-components';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { bugsnagApiRef } from '../..';
import { DateTime } from 'luxon';

export const ErrorGraph = ({ bugsnagError }: { bugsnagError: BugsnagError }) => {
  const api = useApi(bugsnagApiRef);
  const { value } = useAsync(
    async () => {
      return await api.fetchTrends(bugsnagError.project_id, bugsnagError.id);
    }
  );

  const data = value?.map(trend => {
    return {
      from: DateTime.fromISO(trend.from).toLocaleString(),
      to: DateTime.fromISO(trend.to).toLocaleString(),
      events_count: trend.events_count
    };
  });

  return (
    <TrendLine data={data?.map(d => d.events_count)} title="Trend" />
  );
};
