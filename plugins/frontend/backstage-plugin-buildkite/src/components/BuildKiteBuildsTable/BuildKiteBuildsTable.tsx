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

import { FC } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@material-ui/core';
import { Table, Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import RetryIcon from '@material-ui/icons/Replay';
import SyncIcon from '@material-ui/icons/Sync';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Entity } from '@backstage/catalog-model';
import { DateTime } from 'luxon';
import { buildKiteBuildRouteRef } from '../../plugin';
import { useBuilds } from '../useBuilds';
import { useProjectEntity } from '../useProjectEntity';
import { BuildkiteStatus } from './components/BuildKiteRunStatus';
import { BuildkiteBuildInfo, TableProps } from '../types';

const getElapsedTime = (start: string) => {
  return DateTime.fromISO(start).toRelative();
};

const generatedColumns = [
  {
    title: 'Id',
    field: 'number',
    highlight: true,
    width: '5%',
    render: (row: Partial<BuildkiteBuildInfo>) => {
      return row.number;
    },
  },
  {
    title: 'Build',
    field: 'message',
    highlight: true,
    render: (row: Partial<BuildkiteBuildInfo>) => {
      const LinkWrapper = () => {
        const routeLink = useRouteRef(buildKiteBuildRouteRef);
        return (
          <Link
            to={routeLink({
              buildNumber: (row.number as number).toString(),
            })}
          >
            {row.message}
          </Link>
        );
      };
      return (
        <p>
          {row.rebuilt_from?.id && 'retry of: '}
          <LinkWrapper />
        </p>
      );
    },
  },
  {
    title: 'Source',
    field: 'commit',
    render: (row: Partial<BuildkiteBuildInfo>) => (
      <>
        <p>{row.branch}</p>
        <p>{row.commit}</p>
      </>
    ),
    width: '45%',
  },
  {
    title: 'Status',
    field: 'state',
    render: (row: Partial<BuildkiteBuildInfo>) => {
      return (
        <Box display="flex" alignItems="center">
          <BuildkiteStatus status={row.state} />
        </Box>
      );
    },
  },
  {
    title: 'Created',
    render: (row: Partial<BuildkiteBuildInfo>) => {
      return getElapsedTime(row.created_at as string);
    },
  },
  {
    title: 'Actions',
    sorting: false,
    render: (row: Partial<BuildkiteBuildInfo>) => (
      <Tooltip title="Rebuild">
        <IconButton onClick={row.onRestartClick}>
          <SyncIcon />
        </IconButton>
      </Tooltip>
    ),
    width: '5%',
  },
];

export const CITableView: FC<TableProps> = ({
  projectName,
  loading,
  pageSize,
  page,
  retry,
  builds,
  onChangePage,
  onChangePageSize,
  total,
}) => (
  <Table
    isLoading={loading}
    options={{ paging: true, pageSize, padding: 'dense' }}
    totalCount={total}
    page={page}
    actions={[
      {
        icon: () => <RetryIcon />,
        tooltip: 'Refresh Data',
        isFreeAction: true,
        onClick: () => retry(),
      },
    ]}
    data={builds ?? []}
    onPageChange={onChangePage}
    onRowsPerPageChange={onChangePageSize}
    title={
      <Box display="flex" alignItems="center">
        <GitHubIcon />
        <Box mr={1} />
        <Typography variant="h6">{projectName}</Typography>
      </Box>
    }
    columns={generatedColumns}
  />
);

export type BuildkiteBuildsTableProps = {
  defaultBranchOnly?: boolean;
  entity: Entity;
};

const BuildkiteBuildsTable = (props: BuildkiteBuildsTableProps) => {
  const { entity, defaultBranchOnly } = props;
  const { owner, repo, branchAnnotation, defaultBranchOnlyAnnotation } =
    useProjectEntity(entity);

  const [tableProps, { setPage, retry, setPageSize }] = useBuilds({
    owner,
    repo,
    defaultBranchOnly: Boolean(defaultBranchOnly),
    defaultBranchOnlyAnnotation,
    branchAnnotation,
  });

  return (
    <CITableView
      {...tableProps}
      retry={retry}
      onChangePageSize={setPageSize}
      onChangePage={setPage}
    />
  );
};

export default BuildkiteBuildsTable;
