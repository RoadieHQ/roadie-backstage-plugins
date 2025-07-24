/*
 * Copyright 2025 Larder Software Limited
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
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { LAUNCHDARKLY_PROJECT_KEY_ANNOTATION } from '../../constants';
import {
  ErrorBoundary,
  ErrorPanel,
  Link,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { Box, Chip, makeStyles, Typography } from '@material-ui/core';
import {
  MultiEnvironmentFlag,
  useLaunchdarklyMultiEnvironmentFlags,
} from '../../hooks/useLaunchdarklyMultiEnvironmentFlags';
import { FlagDetailsPanel } from '../EntityLaunchdarklyContextOverviewCard/FlagDetailsPanel';
import { useMemo } from 'react';

const useStyles = makeStyles(theme => ({
  settingsButton: {
    marginLeft: theme.spacing(1),
  },
  statusEnabled: {
    color: theme.palette.success.main,
    fontWeight: 'bold',
  },
  statusDisabled: {
    color: theme.palette.error.main,
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
  },
  tagChip: {
    height: '22px',
    fontSize: '0.75rem',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  },
  noTags: {
    color: theme.palette.text.disabled,
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },
}));

export type EntityLaunchdarklyCardProps = {
  title?: string;
  enableSearch?: boolean;
  envs?: string[];
};

const TableHeader = ({ title }: { title?: string }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <Typography variant="h5">{title || 'LaunchDarkly Flags'}</Typography>
    </Box>
  );
};

export const EntityLaunchdarklyCard = (props: EntityLaunchdarklyCardProps) => {
  const { title, enableSearch = false, envs = ['production'] } = props;
  const classes = useStyles();
  const { entity } = useEntity();

  // Fetch flags data
  const {
    value: flags,
    error,
    loading,
  } = useLaunchdarklyMultiEnvironmentFlags(entity, envs);

  const tableColumns: TableColumn<MultiEnvironmentFlag>[] = useMemo(() => {
    const baseColumns: TableColumn<MultiEnvironmentFlag>[] = [
      {
        title: 'Name',
        field: 'name',
        render: row => (
          <Link
            to={Object.values(row.environments)[0]?.link || '#'}
            target="_blank"
          >
            {row.name}
          </Link>
        ),
      },
      {
        title: 'Key',
        field: 'key',
      },
      {
        title: 'Description',
        field: 'description',
        render: row => (
          <span style={{ fontSize: '0.875rem' }}>
            {row.description || 'No description'}
          </span>
        ),
      },
      {
        title: 'Labels',
        field: 'tags',
        render: row => {
          if (!row.tags || row.tags.length === 0) {
            return <span className={classes.noTags}>No labels</span>;
          }
          return (
            <div className={classes.tagContainer}>
              {row.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  className={classes.tagChip}
                  color="primary"
                />
              ))}
            </div>
          );
        },
      },
    ];

    const environmentColumns: TableColumn<MultiEnvironmentFlag>[] = [];
    envs.forEach(envKey => {
      environmentColumns.push({
        title: envKey,
        render: row => {
          const envData = row.environments[envKey];
          if (!envData) return 'N/A';

          return (
            <span
              className={
                envData.on ? classes.statusEnabled : classes.statusDisabled
              }
            >
              {envData.status}
            </span>
          );
        },
      });
    });

    return [...baseColumns, ...environmentColumns];
  }, [envs, classes]);

  // Check if the required annotation is present
  if (!entity.metadata?.annotations?.[LAUNCHDARKLY_PROJECT_KEY_ANNOTATION]) {
    return (
      <MissingAnnotationEmptyState
        annotation={LAUNCHDARKLY_PROJECT_KEY_ANNOTATION}
        readMoreUrl="https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/plugins/frontend/backstage-plugin-launchdarkly/README.md"
      />
    );
  }

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <Table
      columns={tableColumns}
      title={<TableHeader title={title} />}
      data={flags || []}
      detailPanel={({ rowData }) => (
        <ErrorBoundary>
          <FlagDetailsPanel
            flag={{
              name: rowData.name,
              key: rowData.key,
              status: '',
              environmentKey: '',
              link: '',
              variations: rowData.variations,
              description: rowData.description,
              tags: rowData.tags,
              maintainer: rowData.maintainer,
            }}
          />
        </ErrorBoundary>
      )}
      options={{
        paging: true,
        search: enableSearch,
        draggable: false,
        padding: 'dense',
      }}
    />
  );
};
