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
import React from 'react';
import { CloudsmithRepositorySecurityScanProps } from './types';
import { CloudsmithApi, CloudsmithClient } from '../../api';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ErrorPanel, Progress, Table } from '@backstage/core-components';
import { Avatar } from '@material-ui/core';

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
    value: getRepoSecurityScanLogs,
    loading,
    error,
  } = useAsync(async () => {
    return await cloudsmithApi.getRepoSecurityScanLogs({ owner, repo });
  });

  if (loading) {
    return <Progress />;
  }

  if (error || !getRepoSecurityScanLogs) {
    return (
      <ErrorPanel
        error={error || new Error('getRepoSecurityScanLogs were not found')}
      />
    );
  }
  const data = getRepoSecurityScanLogs.filter(
    (item: { has_vulnerabilities: boolean }) =>
      item.has_vulnerabilities === true,
  );

  const formatDate = (date: string | number | Date) => {
    const newDate = new Date(date);
    return `${newDate.toLocaleDateString()} ${newDate.toLocaleTimeString()}`;
  };

  const packageUrl = (item: { package: { version: any } }) => {
    return `https://cloudsmith.io/~${owner}/packages/?q=${item.package.version}`;
  };

  const message = (
    <>
      <Avatar
        src="https://cloudsmith.com/img/cloudsmith-mini-dark.svg"
        style={{ backgroundColor: 'black' }}
      />
      <span>
        Vulnerabilities found in{' '}
        <a
          href={`https://cloudsmith.io/~${owner}/repos/${repo}/`}
          target="_blank"
        >
          {repo}
        </a>
      </span>
    </>
  );

  return (
    <Table
      options={{
        paging: true,
        pageSize: 10,
        search: true,
        sorting: true,
        filtering: true,
      }}
      columns={[
        {
          title: 'Package',
          field: 'package.name',
          render: (item: {
            created_at: string | number | Date;
            package: any;
          }) => (
            <a href={packageUrl(item)} target="_blank">
              {item.package.name}
            </a>
          ),
        },
        {
          title: 'Created At',
          field: 'created_at',
          render: item => formatDate(item.created_at),
        },
        {
          title: 'Max Severity',
          field: 'max_severity',
        },
      ]}
      data={data}
      title={message}
    />
  );
};
