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

import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Table, TableColumn, Link, Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { makeStyles } from '@material-ui/core';
import { useAsync } from 'react-use';
import { bugsnagApiRef } from '../../api';
import { BugsnagError, Project } from '../../api/types';
import { DateTime } from 'luxon';

const useStyles = makeStyles({
  iconClass: {
    verticalAlign: 'middle',
  },
});

const getDetailsUrl = (
  errorId: string,
  errorClass: string,
  organisationName: string,
  projectName: string,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const classes = useStyles();
  const url = `https://app.bugsnag.com/${organisationName}/${projectName}/errors/${errorId}`;
  return (
    <Link to={url}>
      <OpenInNew
        onClick={() => window.open(url, '_blank')}
        aria-label="View"
        fontSize="small"
        className={classes.iconClass}
      />
      {errorClass}
    </Link>
  );
};

export const DenseTable = ({
  errors,
  organisationName,
  projectName,
}: {
  errors: BugsnagError[];
  organisationName: string;
  projectName: string;
}) => {
  const columns: TableColumn[] = [
    { title: '', field: 'class' },
    { title: 'Description', field: 'message', width: '40%' },
    { title: 'Events', field: 'events' },
    { title: 'Users', field: 'users' },
    { title: 'Stage', field: 'stage' },
    { title: 'First seen', field: 'first_seen' },
    { title: 'Last seen', field: 'last_seen' },
    { title: 'Severity', field: 'severity' },
    { title: 'Status', field: 'status' },
  ];

  const data = errors.map(error => {
    return {
      severity: error.severity,
      class: getDetailsUrl(
        error.id,
        error.error_class,
        organisationName,
        projectName,
      ),
      message: error.message,
      status: error.status,
      stage: error.release_stages.join(', '),
      events: error.events,
      id: error.id,
      project_id: error.project_id,
      users: error.users,
      first_seen: DateTime.fromISO(error.first_seen).toLocaleString(),
      last_seen: DateTime.fromISO(error.last_seen).toLocaleString(),
    };
  });

  return (
    <Table
      options={{ search: true, paging: true }}
      columns={columns}
      data={data}
      filters={[
        {
          column: 'Severity',
          type: 'multiple-select',
        },
        {
          column: 'Status',
          type: 'multiple-select',
        },
        {
          column: 'Stage',
          type: 'multiple-select',
        },
      ]}
    />
  );
};

export const ErrorsTable = ({
  organisationName,
  project,
}: {
  organisationName: string;
  project: Project;
}) => {
  const api = useApi(bugsnagApiRef);
  const configApi = useApi(configApiRef);
  const perPage = configApi?.getOptionalNumber('bugsnag.resultsPerPage');
  const { value, loading, error } = useAsync(
    async () =>
      await api.fetchErrors({
        projectId: project.id,
        perPage,
      }),
  );
  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <DenseTable
      organisationName={organisationName}
      projectName={project.slug}
      errors={value || []}
    />
  );
};
