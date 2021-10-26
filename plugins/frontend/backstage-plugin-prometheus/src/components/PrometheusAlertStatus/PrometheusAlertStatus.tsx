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

import {
  InfoCard,
  Progress,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { Chip, Tooltip, makeStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { DateTime } from 'luxon';
import { useAlerts } from '../../hooks/usePrometheus';
import { PrometheusDisplayableAlert } from '../../types';

export default {
  title: 'Data Display/Status',

  component: StatusOK,
};

const useStyles = makeStyles((theme) => ({
  chipRoot: {
    margin: theme.spacing(1),
    height: '100%',
  },
  chipLabel: {
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    textOverflow: 'clip'
  }
}));

const state = (str: string) => {
  switch (str) {
    case 'firing':
      return <StatusError>{str}</StatusError>;
    case 'pending':
      return <StatusPending>{str}</StatusPending>;
    case 'inactive':
      return <StatusAborted>{str}</StatusAborted>;
    default:
      return <StatusAborted>Unknown ({str})</StatusAborted>;
  }
};

const columns: TableColumn<PrometheusDisplayableAlert>[] = [
  {
    field: 'name',
    title: 'Name',
    render: row => (
      <Tooltip title={`${row.query}`}>
        <p>{row.name}</p>
      </Tooltip>
    ),
  },
  { field: 'state', title: 'State', render: row => state(row.state) },
  {
    field: 'lastEvaluation',
    title: 'Last Evaluation',
    render: row =>
      DateTime.fromISO(row.lastEvaluation).toLocaleString(
        DateTime.DATETIME_SHORT_WITH_SECONDS,
      ),
  },
  {
    field: 'value',
    title: 'Value',
    render: row => {
      const formatter = new Intl.NumberFormat('en', {
        notation: 'compact',
      });
      // @ts-ignore
      const shortVal = formatter.format(row.value);
      return (
        <Tooltip title={row.value}>
          <p>{shortVal}</p>
        </Tooltip>
      );
    },
  },
  {
    field: 'labels',
    title: 'Labels',
    render: row => (
      <>
        {Object.entries(row.labels).map(([k, v]) => (
          <Chip key={k + v} label={`${k}: ${v}`} size="small" />
        ))}
      </>
    ),
  },
  {
    field: 'annotations',
    title: 'Annotations',
    render: row => (
      <>
        {Object.entries(row.annotations).map(([k, v]) => (
          <Chip
            key={k + v}
            label={`${k}: ${v}`}
            size="small"
            classes={{ root: useStyles().chipRoot, label: useStyles().chipLabel, }}
          />
        ))}
      </>
    ),
  },
];

export const PrometheusAlertStatus = ({
  alerts,
}: {
  alerts: string[] | 'all';
}) => {
  const { error, loading, displayableAlerts } = useAlerts(alerts);
  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error?.message}</Alert>;
  }
  return (
    <div>
      <InfoCard title="Prometheus Alerts" noPadding>
        <Table
          options={{
            search: false,
            paging: false,
            toolbar: false,
          }}
          data={displayableAlerts}
          columns={columns}
        />
      </InfoCard>
    </div>
  );
};
