/*
 * Copyright 2020 RoadieHQ
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
import React, { FC, useState } from 'react';
import { InputAdornment, IconButton, TextField, Typography, Box, ButtonGroup, Button } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import { Table, TableColumn, MissingAnnotationEmptyState } from '@backstage/core-components';
import { isGithubSlugSet, GITHUB_PULL_REQUESTS_ANNOTATION } from '../../utils/isGithubSlugSet';
import { isRoadieBackstageDefaultFilterSet } from '../../utils/isRoadieBackstageDefaultFilterSet';
import { usePullRequests, PullRequest } from '../usePullRequests';
import { PullRequestState } from '../../types';
import { Entity } from '@backstage/catalog-model';
import { getStatusIconType } from '../Icons';
import { useEntity } from '@backstage/plugin-catalog-react';

const generatedColumns: TableColumn[] = [
  {
    title: 'ID',
    field: 'number',
    highlight: true,
    width: '150px',
    render: (row: Partial<PullRequest>) => (
      <Box fontWeight="fontWeightBold">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={row.url!}
        >
          #{row.number}
        </a>
      </Box>
    ),
  },
  {
    title: 'Title',
    field: 'title',
    highlight: true,
    render: (row: Partial<PullRequest>) => (
      <Typography variant="body2" noWrap>
        {getStatusIconType(row as PullRequest)} <Box ml={1} component="span">{row.title}</Box>
      </Typography>
    ),
  },
  {
    title: 'Creator',
    field: 'creatorNickname',
    highlight: true,
    width: '250px',
    render: (row: Partial<PullRequest>) => (
      <Box fontWeight="fontWeightBold">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={row.creatorProfileLink!}
        >
          {row.creatorNickname}
        </a>
      </Box>
    ),
  },
  {
    title: 'Created',
    field: 'createdTime',
    highlight: true,
    render: (row: Partial<PullRequest>) => (
      <Typography variant="body2" noWrap>
        {row.createdTime}
      </Typography>
    ),
  },
  {
    title: 'Last updated',
    field: 'updatedTime',
    highlight: true,
    render: (row: Partial<PullRequest>) => (
      <Typography variant="body2" noWrap>
        {row.updatedTime}
      </Typography>
    ),
  },
];

type Props = {
  loading: boolean;
  retry: () => void;
  projectName: string;
  page: number;
  prData?: PullRequest[];
  onChangePage: (page: number) => void;
  total: number;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
  StateFilterComponent: FC<{}>;
  SearchComponent: FC<{}>;
};

export const PullRequestsTableView: FC<Props> = ({
  projectName,
  loading,
  pageSize,
  page,
  prData,
  onChangePage,
  onChangePageSize,
  total,
  StateFilterComponent,
  SearchComponent,
}) => {
  return (
    <Table
      isLoading={loading}
      options={{ paging: true, search: false, pageSize, padding: 'dense' }}
      totalCount={total}
      page={page}
      actions={[]}
      data={prData ?? []}
      onPageChange={onChangePage}
      onRowsPerPageChange={onChangePageSize}
      title={
        <>
          <Box display="flex" alignItems="center">
            <GitHubIcon />
            <Box mr={1} />
            <Typography variant="h6">{projectName}</Typography>
          </Box>
          <StateFilterComponent />
          <SearchComponent />
        </>
      }
      columns={generatedColumns}
    />
  );
};

type TableProps = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
  branch?: string;
};

const PullRequests = (__props: TableProps) => {
  const { entity } = useEntity();
  const projectName = isGithubSlugSet(entity);
  const defaultFilter = isRoadieBackstageDefaultFilterSet(entity);
  const [owner, repo] = (projectName ?? '/').split('/');
  const [PRStatusFilter, setPRStatusFilter] = useState<PullRequestState>(
    'open',
  );
  const [search, setSearch] = useState('');
  const [autoFocus, setAutoFocus] = useState(false);
  const [tableProps, { retry, setPage, setPageSize }] = usePullRequests({
    search: search,
    state: PRStatusFilter,
    owner,
    repo,
    defaultFilter,
  });
  const StateFilterComponent = () => (
    <Box position="absolute" right={300} top={20}>
      <ButtonGroup color="primary" aria-label="text primary button group">
        <Button
          color={PRStatusFilter === 'open' ? 'primary' : 'default'}
          onClick={() => setPRStatusFilter('open')}
        >
          OPEN
        </Button>
        <Button
          color={PRStatusFilter === 'closed' ? 'primary' : 'default'}
          onClick={() => setPRStatusFilter('closed')}
        >
          CLOSED
        </Button>
        <Button
          color={PRStatusFilter === 'all' ? 'primary' : 'default'}
          onClick={() => setPRStatusFilter('all')}
        >
          ALL
        </Button>
      </ButtonGroup>
    </Box>
  );
  const SearchComponent = () => (
    <Box position="absolute" right={10} top={25}>
      <TextField
        autoFocus={autoFocus}
        onBlur={() => {
          setAutoFocus(false)
        }}
        onClick={() => {
          setAutoFocus(true)
        }}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Filter"
        value={search}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
                <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                disabled={!search}
                onClick={() => setSearch('')}
              >
                <ClearIcon
                  fontSize="small"
                  aria-label="clear"
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )

  return (
    <PullRequestsTableView
      {...tableProps}
      StateFilterComponent={StateFilterComponent}
      SearchComponent={SearchComponent}
      loading={tableProps.loading}
      retry={retry}
      onChangePageSize={setPageSize}
      onChangePage={setPage}
    />
  );
}

export const PullRequestsTable = (__props: TableProps) => {
  const { entity } = useEntity();
  const projectName = isGithubSlugSet(entity);
  if (!projectName || projectName === '') {
    return <MissingAnnotationEmptyState annotation={GITHUB_PULL_REQUESTS_ANNOTATION} />
  }
  return <PullRequests/>
};
