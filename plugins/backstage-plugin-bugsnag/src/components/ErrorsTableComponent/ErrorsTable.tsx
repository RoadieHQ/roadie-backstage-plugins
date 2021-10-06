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

import React from 'react';
import useSWR, { SWRConfig } from 'swr';
import { Table, TableColumn, Link, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { makeStyles } from '@material-ui/core';
import { BugsnagError, Project, Organisation } from '../../api/types';
import { DateTime } from 'luxon';

const useStyles = makeStyles({
  iconClass: {
    verticalAlign: 'middle',
  },
});

const fetcher = async (url: RequestInfo) => {
  const res = await fetch(url);
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.errors[0]);
  }
  return payload;
};

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
    { title: 'Events', field: 'events' },
    { title: 'Users', field: 'users' },
    { title: 'Stage', field: 'stage' },
    { title: 'First seen', field: 'first_seen' },
    { title: 'Last seen', field: 'last_seen' },
    { title: 'Severity', field: 'severity' },
  ];

  const data = errors.map(
    (err: {
      severity: any;
      id: string;
      error_class: string;
      release_stages: any;
      events: any;
      project_id: any;
      users: any;
      first_seen: string;
      last_seen: string;
    }) => {
      return {
        severity: err.severity,
        class: getDetailsUrl(
          err.id,
          err.error_class,
          organisationName,
          projectName || '',
        ),
        stage: err.release_stages,
        events: err.events,
        id: err.id,
        project_id: err.project_id,
        users: err.users,
        first_seen: DateTime.fromISO(err.first_seen).toLocaleString(),
        last_seen: DateTime.fromISO(err.last_seen).toLocaleString(),
      };
    },
  );

  return (
    <Table
      title="Errors overview"
      options={{ search: true, paging: true }}
      columns={columns}
      data={data}
    />
  );
};

export const AllErrors = ({
  projects,
  projectApiKey,
  organisationName,
  apiUrl,
}: {
  projects: Project[];
  projectApiKey: string;
  organisationName: string;
  apiUrl: string;
}) => {
  const filteredProject = projects.find(
    (proj: { api_key: string | string[] }) =>
      proj.api_key.includes(projectApiKey),
  );

  const projectName = filteredProject?.slug;

  const { data: errors, error: isError } = useSWR(
    `${apiUrl}/projects/${filteredProject?.id}/errors`,
  );

  if (!errors) {
    return <Progress />;
  } else if (isError) {
    return <Alert severity="error">{isError.message}</Alert>;
  }

  return (
    <DenseTable
      errors={errors}
      organisationName={organisationName}
      projectName={projectName || ''}
    />
  );
};

export const Projects = ({
  apiUrl,
  organisations,
  organisationName,
  projectApiKey,
}: {
  apiUrl: string;
  organisations: Organisation[];
  organisationName: string;
  projectApiKey: string;
}) => {
  const organisation = organisations.find((org: { name: string | string[] }) =>
    org.name.includes(organisationName),
  );

  const { data: projects, error: projectError } = useSWR(
    `${apiUrl}/organizations/${organisation?.id}/projects`,
  );

  const orgName = organisation?.slug;

  if (!projects) {
    return <Progress />;
  } else if (projectError) {
    return <Alert severity="error">{projectError.message}</Alert>;
  }

  return (
    <AllErrors
      projects={projects}
      projectApiKey={projectApiKey}
      organisationName={orgName || ''}
      apiUrl={apiUrl}
    />
  );
};

export const Organisations = ({
  apiUrl,
  organisationName,
  projectApiKey,
}: {
  apiUrl: string;
  organisationName: string;
  projectApiKey: string;
}) => {
  const { data: organisations, error: organisationError } = useSWR(
    `${apiUrl}/user/organizations`,
  );

  if (!organisations) {
    return <Progress />;
  } else if (organisationError) {
    return <Alert severity="error">{organisationError.message}</Alert>;
  }

  return (
    <Projects
      apiUrl={apiUrl}
      organisations={organisations}
      organisationName={organisationName}
      projectApiKey={projectApiKey}
    />
  );
};

export const ErrorsTable = ({
  apiUrl,
  organisationName,
  projectApiKey,
}: {
  apiUrl: string;
  organisationName: string;
  projectApiKey: string;
}) => {
  return (
    <SWRConfig
      value={{
        refreshInterval: 60000,
        revalidateOnMount: false,
        fetcher,
      }}
    >
      <Organisations
        apiUrl={apiUrl}
        organisationName={organisationName}
        projectApiKey={projectApiKey}
      />
    </SWRConfig>
  );
};
