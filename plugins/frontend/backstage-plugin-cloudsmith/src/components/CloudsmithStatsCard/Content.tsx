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

import { CloudsmithStatsCardContentProps } from './types';
import { CloudsmithApi, CloudsmithClient } from '../../api';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ErrorPanel, Progress } from '@backstage/core-components';
import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Card,
  CardHeader,
  Avatar,
  CardContent,
} from '@material-ui/core';

/**
 * A component to render the stats about a cloudsmith repo
 *
 * @public
 */
export const Content = ({ owner, repo }: CloudsmithStatsCardContentProps) => {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const cloudsmithApi: CloudsmithApi = new CloudsmithClient({
    fetchApi,
    discoveryApi,
  });

  const {
    value: repoStats,
    loading,
    error,
  } = useAsync(async () => {
    return await cloudsmithApi.getRepoMetrics({ owner, repo });
  });

  if (loading) {
    return <Progress />;
  }

  if (error || !repoStats) {
    return (
      <ErrorPanel error={error || new Error('repoStats were not found')} />
    );
  }

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar
            src="https://cloudsmith.com/img/cloudsmith-mini-dark.svg"
            style={{ backgroundColor: 'black' }}
          />
        }
        title="Cloudsmith Repo Stats"
      />
      <CardContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {owner}/{repo}
                </TableCell>
                <TableCell align="right">Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow key="active">
                <TableCell component="th" scope="row">
                  Active
                </TableCell>
                <TableCell align="right">{repoStats.packages.active}</TableCell>
              </TableRow>
              <TableRow key="inactive">
                <TableCell component="th" scope="row">
                  Inactive
                </TableCell>
                <TableCell align="right">
                  {repoStats.packages.inactive}
                </TableCell>
              </TableRow>
              <TableRow key="Total">
                <TableCell component="th" scope="row">
                  Total
                </TableCell>
                <TableCell align="right">{repoStats.packages.total}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
