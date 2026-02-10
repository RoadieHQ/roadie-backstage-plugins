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
import {
  InfoCard,
  Link,
  Progress,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { Chip, Tooltip, makeStyles, Grid, Typography } from '@material-ui/core';
// eslint-disable-next-line
import Alert from '@material-ui/lab/Alert';
import { DateTime } from 'luxon';
import { useAlerts } from '../../hooks/usePrometheus';
import { OnRowClick, PrometheusDisplayableAlert } from '../../types';

export default {
  title: 'Data Display/Status',

  component: StatusOK,
};

const useStyles = makeStyles(theme => ({
  chipRoot: {
    margin: theme.spacing(1),
    height: '100%',
  },
  chipLabel: {
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    textOverflow: 'clip',
  },
}));

const state = (str: string) => {
  switch (str) {
    case 'firing':
      return <StatusError>{str}</StatusError>;
    case 'pending':
      return <StatusPending>{str}</StatusPending>;
    case 'inactive':
      return <StatusOK>{str}</StatusOK>;
    default:
      return <StatusAborted>Unknown ({str})</StatusAborted>;
  }
};

const getColumns = (
  showAnnotations: boolean,
  showLabels: boolean,
): TableColumn<PrometheusDisplayableAlert>[] => {
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
        if (!row.value) {
          return <p>-</p>;
        }
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
  ];

  if (showLabels) {
    columns.push({
      field: 'labels',
      title: 'Labels',
      render: row => (
        <>
          {Object.entries(row.labels).map(([k, v]) => (
            <Chip key={k + v} label={`${k}: ${v}`} size="small" />
          ))}
        </>
      ),
    });
  }

  if (showAnnotations) {
    columns.push({
      field: 'annotations',
      title: 'Annotations',
      render: row => (
        <>
          {Object.entries(row.annotations).map(([k, v]) => (
            <Chip
              key={k + v}
              label={`${k}: ${v}`}
              size="small"
              classes={{
                root: useStyles().chipRoot,
                label: useStyles().chipLabel,
              }}
            />
          ))}
        </>
      ),
    });
  }

  return columns;
};

export const PrometheusAlertStatus = ({
  alerts,
  extraColumns,
  onRowClick,
  showAnnotations = true,
  showLabels = true,
  showInactiveAlerts = false,
}: {
  alerts: string[] | 'all';
  extraColumns?: TableColumn<PrometheusDisplayableAlert>[];
  onRowClick?: OnRowClick;
  showAnnotations?: boolean;
  showLabels?: boolean;
  showInactiveAlerts?: boolean;
}) => {
  const { error, loading, displayableAlerts, uiUrl } = useAlerts(
    alerts,
    showInactiveAlerts,
  );
  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error?.message}</Alert>;
  }

  const statePriority: Record<string, number> = {
    firing: 0,
    pending: 1,
    inactive: 2,
  };

  const sortedAlerts = [...displayableAlerts].sort((a, b) => {
    const aPriority = statePriority[a.state] ?? 99;
    const bPriority = statePriority[b.state] ?? 99;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return a.name.localeCompare(b.name);
  });

  const title = (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>Prometheus Alerts</Grid>
      {uiUrl && (
        <Grid item>
          <Typography variant="subtitle1">
            <Link to={`${uiUrl}/alerts`}>Go to Prometheus</Link>
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  const columns = getColumns(showAnnotations, showLabels);

  return (
    <div>
      <InfoCard title={title} noPadding>
        <Table
          options={{
            search: false,
            paging: true,
            pageSize: 5,
            pageSizeOptions: [5, 10, 20, 50],
            toolbar: false,
          }}
          onRowClick={
            onRowClick ? (_, rowData) => onRowClick(rowData!) : undefined
          }
          data={sortedAlerts}
          columns={extraColumns ? columns.concat(extraColumns) : columns}
        />
      </InfoCard>
    </div>
  );
};
