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
import { CloudsmithRepositoryAuditLogContentProps } from './types';
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
}: CloudsmithRepositoryAuditLogContentProps) => {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const cloudsmithApi: CloudsmithApi = new CloudsmithClient({
    fetchApi,
    discoveryApi,
  });

  const {
    value: getRepoAuditLogs,
    loading,
    error,
  } = useAsync(async () => {
    return await cloudsmithApi.getRepoAuditLogs({ owner, repo });
  });

  if (loading) {
    return <Progress />;
  }

  if (error || !getRepoAuditLogs) {
    return (
      <ErrorPanel
        error={error || new Error('getRepoAuditLogs were not found')}
      />
    );
  }

  const data = getRepoAuditLogs.map(
    (item: {
      actor: any;
      event: any;
      event_at: any;
      object: any;
      object_kind: any;
    }) => {
      return {
        actor: item.actor,
        event: item.event,
        event_at: item.event_at,
        object: item.object,
        object_kind: item.object_kind,
      };
    },
  );

  const formatDate = (date: string | number | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const message = (
    <>
      <Avatar
        src="https://cloudsmith.com/img/cloudsmith-mini-dark.svg"
        style={{ backgroundColor: 'black' }}
      />
      <span>
        Audit Logs for{' '}
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
        { title: 'Actor', field: 'actor' },
        { title: 'Event', field: 'event' },
        {
          title: 'Event At',
          field: 'event_at',
          render: rowData => formatDate(rowData.event_at),
        },
        { title: 'Object', field: 'object' },
        { title: 'Object Kind', field: 'object_kind' },
      ]}
      data={data}
      title={message}
    />
  );
};
