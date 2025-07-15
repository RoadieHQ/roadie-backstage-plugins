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
import { ChangeEvent, useState } from 'react';
import { CloudsmithRepositorySecurityScanProps } from './types';
import { CloudsmithApi, CloudsmithClient } from '../../api';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import {
  ErrorPanel,
  Progress,
  InfoCard,
  Table,
  Link,
  TableColumn,
} from '@backstage/core-components';
import {
  TableContainer,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  TableRow,
  TableCell,
  CircularProgress,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import SecurityIcon from '@material-ui/icons/Security';
import WarningIcon from '@material-ui/icons/Warning';
import { Pagination } from '@material-ui/lab';

/**
 * A component to render audit log data for a Cloudsmith repository.
 *
 * @public
 */

export const Content = ({
  owner,
  repo,
}: CloudsmithRepositorySecurityScanProps) => {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const cloudsmithApi: CloudsmithApi = new CloudsmithClient({
    fetchApi,
    discoveryApi,
  });

  const {
    value: vulnerabilities,
    loading,
    error,
  } = useAsync(async () => {
    const data = await cloudsmithApi.getRepoSecurityScanLogs({ owner, repo });
    return data.filter(
      (item: { has_vulnerabilities: boolean }) =>
        item.has_vulnerabilities === true,
    );
  });

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  if (!vulnerabilities || vulnerabilities.length === 0) {
    return (
      <InfoCard title={`Vulnerabilities in ${repo}`}>
        No vulnerabilities found in this repository.
      </InfoCard>
    );
  }

  const columns = [
    { title: '', field: 'expand', sorting: false, width: '50px' },
    { title: 'Package Name', field: 'package.name' },
    { title: 'Version', field: 'package.version' },
    { title: 'Max Severity', field: 'max_severity' },
    { title: 'Vulnerabilities Count', field: 'vulnerabilities_count' },
    {
      title: 'Created At',
      field: 'created_at',
      render: (row: any) => new Date(row.created_at).toLocaleString(),
    },
    {
      title: 'Actions',
      sorting: false,
      render: (row: any) => (
        <Link
          to={`https://cloudsmith.io/~${owner}/packages/?q=${row.package.name}+${row.package.version}`}
        >
          View Package
        </Link>
      ),
    },
  ];

  const Row = ({
    row,
    rowOwner,
    rowRepo,
  }: {
    row: any;
    rowOwner: string;
    rowRepo: string;
  }) => {
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<any[]>([]);
    const [rowError, setRowError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const handleRowClick = async () => {
      setOpen(!open);
      if (!open && !details.length) {
        setIsLoading(true);
        try {
          const vulnerabilityDetails =
            await cloudsmithApi.getPackageScanResults({
              owner: rowOwner,
              repo: rowRepo,
              packageIdentifier: row.package?.identifier || '',
              scanResultIdentifier: row.identifier || '',
            });
          setDetails(vulnerabilityDetails.scan?.results || []);
        } catch (err) {
          setRowError(new Error('Failed to fetch vulnerability details'));
        } finally {
          setIsLoading(false);
        }
      }
    };

    const handleChangePage = (_: ChangeEvent<unknown>, newPage: number) => {
      setPage(newPage);
    };

    const detailColumns: TableColumn[] = [
      { title: 'CVE', field: 'vulnerability_id' },
      { title: 'Severity', field: 'severity' },
      { title: 'Package Name', field: 'package_name' },
      { title: 'Title', field: 'title' },
      { title: 'Description', field: 'description' },
      {
        title: 'Affected Version',
        field: 'affected_version',
        render: (vulnerabilityRow: any) =>
          vulnerabilityRow.affected_version?.version || 'N/A',
      },
      {
        title: 'Fixed Version',
        field: 'fixed_version',
        render: (vulnerabilityRow: any) =>
          vulnerabilityRow.fixed_version?.version || 'N/A',
      },
    ];

    const paginatedDetails = details
      ? details.slice((page - 1) * rowsPerPage, page * rowsPerPage)
      : [];

    return (
      <>
        <TableRow hover onClick={handleRowClick} style={{ cursor: 'pointer' }}>
          <TableCell>
            <IconButton size="small">
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{row.package.name}</TableCell>
          <TableCell>{row.package.version}</TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              {row.max_severity === 'critical' && <WarningIcon color="error" />}
              {row.max_severity}
            </Box>
          </TableCell>
          <TableCell>{row.num_vulnerabilities}</TableCell>
          <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
          <TableCell>
            <Link
              to={`https://cloudsmith.io/~${owner}/packages/?q=${row.package.name}+${row.package.version}`}
            >
              View Package
            </Link>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Typography variant="h6" gutterBottom component="div">
                  Vulnerability Details
                </Typography>
                {isLoading && (
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} />
                    <Typography variant="body2" style={{ marginLeft: 10 }}>
                      Loading vulnerability details...
                    </Typography>
                  </Box>
                )}
                {!isLoading && rowError && <ErrorPanel error={rowError} />}
                {!isLoading && !rowError && details && (
                  <>
                    <Table
                      columns={detailColumns}
                      data={paginatedDetails}
                      options={{ search: false, paging: false }}
                    />
                    <Pagination
                      count={Math.ceil(details.length / rowsPerPage)}
                      page={page}
                      onChange={handleChangePage}
                      color="primary"
                      style={{
                        marginTop: '1rem',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    />
                  </>
                )}
                {!isLoading && !rowError && !details && (
                  <Typography>No vulnerability details available.</Typography>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <InfoCard title={`Vulnerabilities found in ${repo}`}>
      <TableContainer component={Paper}>
        <Table
          options={{ search: true, paging: true, sorting: true }}
          columns={columns}
          data={vulnerabilities}
          title={
            <Box display="flex" alignItems="center">
              <SecurityIcon color="primary" style={{ marginRight: 8 }} />{' '}
              Security Scan Results
            </Box>
          }
          components={{
            Row: ({ data }) => (
              <Row row={data} rowOwner={owner} rowRepo={repo} />
            ),
          }}
        />
      </TableContainer>
    </InfoCard>
  );
};
