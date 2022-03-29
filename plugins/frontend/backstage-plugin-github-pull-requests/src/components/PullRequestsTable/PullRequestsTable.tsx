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

import React, { FC, useState, useRef } from 'react';
import { debounce } from 'lodash';
import {
  InputAdornment,
  IconButton,
  TextField,
  Typography,
  Box,
  ButtonGroup,
  Button,
} from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import {
  Table,
  TableColumn,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import {
  isGithubSlugSet,
  GITHUB_PULL_REQUESTS_ANNOTATION,
} from '../../utils/isGithubSlugSet';
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
        <a target="_blank" rel="noopener noreferrer" href={row.url!}>
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
        {getStatusIconType(row as PullRequest)}{' '}
        <Box ml={1} component="span">
          {row.title}
        </Box>
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
  StateFilterComponent?: FC<{}>;
  SearchComponent?: FC<{}>;
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
          {StateFilterComponent ? <StateFilterComponent /> : <></>}
          {SearchComponent ? <SearchComponent /> : <></>}
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
  const [search, setSearch] = useState(`state:open ${defaultFilter}`);
  const setSearchValueDebounced = useRef(debounce(setSearch, 500));
  const onChangePRStatusFilter = (state: PullRequestState) => {
    if (state === 'all') {
      setSearch((currentSearch: string) =>
        currentSearch.replace(/state:(open|closed)/g, '').trim(),
      );
    } else {
      setSearch((currentSearch: string) =>
        currentSearch.search(/state:(open|closed)/g) === -1
          ? `state:${state} ${currentSearch}`
          : currentSearch.replace(/state:(open|closed)/g, `state:${state}`),
      );
    }
  };
  const [tableProps, { retry, setPage, setPageSize }] = usePullRequests({
    search: search,
    owner,
    repo,
  });
  const StateFilterComponent = () => (
    <Box position="absolute" right={525} top={20}>
      <ButtonGroup color="primary" aria-label="text primary button group">
        <Button
          color={search.search('state:open') !== -1 ? 'primary' : 'default'}
          onClick={() => onChangePRStatusFilter('open')}
        >
          OPEN
        </Button>
        <Button
          color={search.search('state:closed') !== -1 ? 'primary' : 'default'}
          onClick={() => onChangePRStatusFilter('closed')}
        >
          CLOSED
        </Button>
        <Button
          color={search.search('state') === -1 ? 'primary' : 'default'}
          onClick={() => onChangePRStatusFilter('all')}
        >
          ALL
        </Button>
      </ButtonGroup>
    </Box>
  );
  const SearchComponent = () => {
    const [draftSearch, setDraftSearch] = useState(search);
    return (
      <Box position="absolute" width={500} right={10} top={25}>
        <TextField
          fullWidth
          onChange={event => {
            setDraftSearch(event.target.value);
            setSearchValueDebounced.current(event.target.value);
          }}
          placeholder="Filter"
          value={draftSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  disabled={!draftSearch}
                  onClick={() => {
                    setDraftSearch('');
                    setSearch('');
                  }}
                >
                  <ClearIcon fontSize="small" aria-label="clear" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    );
  };

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
};

export const PullRequestsTable = (__props: TableProps) => {
  const { entity } = useEntity();
  const projectName = isGithubSlugSet(entity);
  if (!projectName || projectName === '') {
    return (
      <MissingAnnotationEmptyState
        annotation={GITHUB_PULL_REQUESTS_ANNOTATION}
      />
    );
  }
  return <PullRequests />;
};
