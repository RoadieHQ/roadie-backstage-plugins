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
  Link,
  Theme,
  makeStyles,
  LinearProgress,
  TableContainer,
  Card,
  Typography,
} from '@material-ui/core';
import { Table } from '@backstage/core-components';
import { Build, useBuilds } from '../hooks/useBuilds';
import { getStatusComponent } from './BuildsPage/lib/CITable/CITable';

const useStyles = makeStyles<Theme>({
  buildName: {
    display: 'inline-block',
    maxWidth: '190px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export const LastBuildCard = () => {
  const classes = useStyles();
  const [{ value, loading }] = useBuilds();
  if (loading || !value) return <LinearProgress />;

  return (
    <TableContainer component={Card}>
      <Table
        title="Recent Travis-CI Builds"
        subtitle="All Branches"
        isLoading={loading}
        options={{
          search: false,
          paging: false,
        }}
        columns={[
          {
            title: 'Build name',
            field: 'buildName',
            render: (data: Build) => (
              <Link
                href={data.buildUrl}
                target="_blank"
                className={classes.buildName}
              >
                {data.buildName}
              </Link>
            ),
          },
          {
            title: 'Status',
            field: 'status',
            render: (data: Build) => (
              <Typography variant="button">
                {getStatusComponent(data.status)}
                {data.status}
              </Typography>
            ),
          },
          { title: 'Branch', field: 'source.branchName' },
        ]}
        data={value}
      />
    </TableContainer>
  );
};
