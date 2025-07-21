import { FC } from 'react';
import { Typography, Box, IconButton, Link } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import {
  StatusError,
  StatusWarning,
  StatusOK,
  StatusPending,
  StatusRunning,
  Table,
  TableColumn,
} from '@backstage/core-components';
import formatDistance from 'date-fns/formatDistance';
import { TravisIcon } from './travisIcon';

export type CITableBuildInfo = {
  id: string;
  buildName: string;
  buildUrl?: string;
  finishedAt: string;
  duration: number;
  source: {
    branchName: string;
    commit: {
      hash: string;
      url: string;
    };
  };
  status: string;
  tests?: {
    total: number;
    passed: number;
    skipped: number;
    failed: number;
    testUrl: string;
  };
  onRestartClick: () => void;
};

export const getStatusComponent = (status: string | undefined = '') => {
  switch (status.toLowerCase()) {
    case 'queued':
    case 'created':
      return <StatusPending />;
    case 'started':
      return <StatusRunning />;
    case 'failed':
      return <StatusError />;
    case 'passed':
      return <StatusOK />;
    case 'canceled':
    default:
      return <StatusWarning />;
  }
};

const generatedColumns: TableColumn[] = [
  {
    title: 'ID',
    field: 'id',
    type: 'numeric',
    width: '80px',
  },
  {
    title: 'Build',
    field: 'buildName',
    highlight: true,
    render: (row: Partial<CITableBuildInfo>) => (
      <Link href={row.buildUrl} target="_blank" rel="noopener noreferrer">
        {row.buildName}
      </Link>
    ),
    sorting: false,
  },
  {
    title: 'Source',
    render: (row: Partial<CITableBuildInfo>) => (
      <>
        <p>{row.source?.branchName}</p>
        <p>{row.source?.commit.hash}</p>
      </>
    ),
    sorting: false,
  },
  {
    title: 'Status',
    render: (row: Partial<CITableBuildInfo>) => (
      <Box display="flex" alignItems="center">
        {getStatusComponent(row.status)}
        <Box mr={1} />
        <Typography variant="button">{row.status}</Typography>
      </Box>
    ),
    width: '150px',
    sorting: false,
  },
  {
    title: 'Date',
    render: (row: Partial<CITableBuildInfo>) => {
      return (
        <>
          <p>
            {row.finishedAt
              ? `${formatDistance(new Date(), new Date(row.finishedAt!))} ago`
              : 'In progress'}
          </p>
          <p>{row.duration} sec</p>
        </>
      );
    },
    width: '150px',
    sorting: false,
  },
  {
    title: 'Actions',
    render: (row: Partial<CITableBuildInfo>) => (
      <IconButton onClick={row.onRestartClick}>
        <RetryIcon />
      </IconButton>
    ),
    width: '100px',
    sorting: false,
  },
];

type Props = {
  loading: boolean;
  retry: () => void;
  builds: CITableBuildInfo[];
  projectName: string;
  page: number;
  onChangePage: (page: number) => void;
  total: number;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
};

export const CITable: FC<Props> = ({
  projectName,
  loading,
  pageSize,
  page,
  retry,
  builds,
  onChangePage,
  onChangePageSize,
  total,
}) => {
  return (
    <>
      <Table
        isLoading={loading}
        options={{ paging: true, pageSize }}
        totalCount={total}
        page={page}
        actions={[
          {
            icon: () => <RetryIcon />,
            tooltip: 'Refresh Data',
            isFreeAction: true,
            onClick: retry,
          },
        ]}
        data={builds}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangePageSize}
        title={
          <Box display="flex" alignItems="center">
            <TravisIcon />
            <Box mr={1} />
            <Typography variant="h6">{projectName}</Typography>
          </Box>
        }
        columns={generatedColumns}
      />
    </>
  );
};
