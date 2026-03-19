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

import { CloudsmithRepositoryAuditLogContentProps } from './types';
import { CloudsmithApi, CloudsmithClient } from '../../api';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ErrorPanel, Progress, Table } from '@backstage/core-components';
import {
  Avatar,
  Chip,
  makeStyles,
  Tooltip,
  Typography,
  Box,
  Link,
  Button,
  Grid,
} from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium as number,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  locationIcon: {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5),
  },
  expandedRow: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
  },
  expandedItem: {
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const getEventColor = (event: string) => {
  const eventTypes = {
    create: '#4caf50',
    update: '#2196f3',
    delete: '#f44336',
    download: '#ff9800',
  } as { [key: string]: string };
  return eventTypes[event.split('.')[0]] || '#9e9e9e';
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // Show notification that text was copied
    const notification = document.createElement('div');
    notification.textContent = 'Copied to clipboard';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';

    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  });
};

export const Content = ({
  owner,
  repo,
}: CloudsmithRepositoryAuditLogContentProps) => {
  const classes = useStyles();
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const cloudsmithApi: CloudsmithApi = new CloudsmithClient({
    fetchApi,
    discoveryApi,
  });

  const {
    value: getRepoAuditLogs,
    loading,
    error,
  } = useAsync(async () => {
    const result = await cloudsmithApi.getRepoAuditLogs({ owner, repo });
    return result;
  });

  if (loading) {
    return <Progress />;
  }

  if (error || !getRepoAuditLogs) {
    return (
      <ErrorPanel
        error={error || new Error('getRepoAuditLogs were not found')}
      />
    );
  }

  // Ensure we're working with an array of audit log entries
  const auditLogs = Array.isArray(getRepoAuditLogs) ? getRepoAuditLogs : [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const safeRender = (value: any) => value ?? 'N/A';

  const renderLocation = (rowData: any) => {
    const location = rowData.actor_location;
    if (!location) return 'N/A';

    return (
      <Tooltip
        title={`${location.city || 'Unknown City'}, ${
          location.country || 'Unknown Country'
        }`}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon className={classes.locationIcon} />
          <Typography variant="body2">
            {location.country_code || 'N/A'}
          </Typography>
        </div>
      </Tooltip>
    );
  };

  const message = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Avatar
        src="https://cloudsmith.com/img/cloudsmith-mini-dark.svg"
        style={{ backgroundColor: 'black', width: 24, height: 24 }}
      />
      <Typography variant="h6">
        Audit Logs for{' '}
        <a
          href={`https://cloudsmith.io/~${owner}/repos/${repo}/`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontWeight: 'bold', color: '#1976d2' }}
        >
          {repo}
        </a>
      </Typography>
    </div>
  );

  return (
    <Table
      options={{
        paging: true,
        pageSize: 10,
        pageSizeOptions: [10, 20, 50],
        search: true,
        sorting: true,
        padding: 'dense',
        headerStyle: {
          backgroundColor: '#f5f5f5',
          color: '#333',
          fontWeight: 'bold',
        },
      }}
      columns={[
        {
          title: 'Actor',
          field: 'actor',
          render: (rowData: any) => (
            <Tooltip
              title={`${safeRender(rowData.actor_kind)} - ${safeRender(
                rowData.actor_ip_address,
              )}`}
            >
              <Typography variant="body2">
                {safeRender(rowData.actor)}
              </Typography>
            </Tooltip>
          ),
        },
        {
          title: 'Event',
          field: 'event',
          render: (rowData: any) => (
            <Chip
              label={safeRender(rowData.event)}
              size="small"
              className={classes.chip}
            />
          ),
        },
        {
          title: 'Date',
          field: 'event_at',
          render: (rowData: any) => (
            <Typography variant="body2">
              {rowData.event_at ? formatDate(rowData.event_at) : 'N/A'}
            </Typography>
          ),
        },
        {
          title: 'Object',
          field: 'object',
          render: (rowData: any) => (
            <Typography variant="body2" noWrap>
              {safeRender(rowData.object)}
            </Typography>
          ),
        },
        {
          title: 'Location',
          field: 'actor_location',
          render: renderLocation,
        },
      ]}
      data={auditLogs}
      title={message}
      detailPanel={data => {
        const rowData = data.rowData;
        const eventColor = getEventColor(rowData.event);
        return (
          <Box className={classes.expandedRow}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" className={classes.expandedItem}>
                  Actor Details
                </Typography>
                <Typography variant="body2">
                  Name: {safeRender(rowData.actor)}
                </Typography>
                <Typography variant="body2">
                  Kind: {safeRender(rowData.actor_kind)}
                </Typography>
                <Typography variant="body2">
                  IP:{' '}
                  <Link
                    href={`https://whatismyipaddress.com/ip/${rowData.actor_ip_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {safeRender(rowData.actor_ip_address)}
                  </Link>
                </Typography>
                <Typography variant="body2">
                  Slug: {safeRender(rowData.actor_slug_perm)}
                </Typography>
                <Typography variant="body2">
                  URL:{' '}
                  <Link
                    href={safeRender(rowData.actor_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {safeRender(rowData.actor_url)}
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" className={classes.expandedItem}>
                  Location Details
                </Typography>
                <Typography variant="body2">
                  City: {safeRender(rowData.actor_location?.city)}
                </Typography>
                <Typography variant="body2">
                  Country: {safeRender(rowData.actor_location?.country)}
                </Typography>
                <Typography variant="body2">
                  Continent: {safeRender(rowData.actor_location?.continent)}
                </Typography>
                <Typography variant="body2">
                  Postal Code: {safeRender(rowData.actor_location?.postal_code)}
                </Typography>
                <Typography variant="body2">
                  Coordinates:{' '}
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${rowData.actor_location?.latitude},${rowData.actor_location?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {safeRender(rowData.actor_location?.latitude)},{' '}
                    {safeRender(rowData.actor_location?.longitude)}
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" className={classes.expandedItem}>
                  Event Details
                </Typography>
                <Typography variant="body2">
                  Event:{' '}
                  <Chip
                    label={safeRender(rowData.event)}
                    style={{ backgroundColor: eventColor, color: '#fff' }}
                  />
                </Typography>
                <Typography variant="body2">
                  Date:{' '}
                  {rowData.event_at ? formatDate(rowData.event_at) : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Context: {safeRender(rowData.context)}
                </Typography>
                <Typography variant="body2">
                  Object: {safeRender(rowData.object)}
                </Typography>
                <Typography variant="body2">
                  Object Kind: {safeRender(rowData.object_kind)}
                </Typography>
                <Typography variant="body2">
                  Object Slug: {safeRender(rowData.object_slug_perm)}
                </Typography>
                <Typography variant="body2">
                  UUID: {safeRender(rowData.uuid)}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileCopyIcon />}
                  onClick={() =>
                    copyToClipboard(JSON.stringify(rowData, null, 2))
                  }
                  style={{ marginTop: '8px' }}
                >
                  Copy Details
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      }}
    />
  );
};
