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

import { Table, TableColumn } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Link, List, ListItem } from '@material-ui/core';
import { ReactNode } from 'react';
import SyncIcon from '@material-ui/icons/Sync';
import { DateTime } from 'luxon';
import {
  ArgoCDAppDeployRevisionDetails,
  ArgoCDAppHistoryDetails,
} from '../types';

export type ArgoCDHistoryTableRow = ArgoCDAppHistoryDetails & {
  app: string;
  appNamespace: string;
  instance?: string;
  frontendUrl?: string;
  revisionDetails?: ArgoCDAppDeployRevisionDetails;
};

export const ArgoCDHistoryTable = ({
  data,
  retry,
}: {
  data: ArgoCDHistoryTableRow[];
  retry: () => void;
}) => {
  const configApi = useApi(configApiRef);
  const namespaced =
    configApi.getOptionalBoolean('argocd.namespacedApps') ?? false;
  const baseUrl = configApi.getOptionalString('argocd.baseUrl');
  const supportsMultipleArgoInstances: boolean = Boolean(
    configApi.getOptionalConfigArray('argocd.appLocatorMethods')?.length,
  );

  const linkUrl = (row: any): string | undefined => {
    if (supportsMultipleArgoInstances && !baseUrl) {
      const instanceConfig = configApi
        .getConfigArray('argocd.appLocatorMethods')
        .find(value => value.getOptionalString('type') === 'config')
        ?.getOptionalConfigArray('instances')
        ?.find(value => value.getOptionalString('name') === row?.instance);
      return (
        instanceConfig?.getOptionalString('frontendUrl') ??
        instanceConfig?.getOptionalString('url')
      );
    }
    return baseUrl;
  };

  const columns: TableColumn[] = [
    {
      title: 'Name',
      field: 'name',
      render: (row: any): ReactNode =>
        linkUrl ? (
          <Link
            href={`${linkUrl(row)}/applications/${
              namespaced ? `${row.appNamespace}/${row.app}` : row.app
            }`}
            target="_blank"
            rel="noopener"
          >
            {row.app}
          </Link>
        ) : (
          row.app
        ),
    },
    {
      title: 'Deploy Details',
      defaultSort: 'desc',
      field: 'deployedAt',
      render: (row: any): ReactNode => (
        <List dense style={{ padding: '0px' }}>
          <ListItem style={{ paddingLeft: '0px' }}>
            {row.deployedAt
              ? `Deployed at ${DateTime.fromISO(row.deployedAt)
                  .toLocal()
                  .toFormat('dd MMM yyyy, HH:mm:ss')}`
              : null}
          </ListItem>
          <ListItem style={{ paddingLeft: '0px' }}>
            {row.deployStartedAt
              ? `Run ${DateTime.fromISO(row.deployStartedAt)
                  .toLocal()
                  .toRelative()}`
              : null}
          </ListItem>
          <ListItem style={{ paddingLeft: '0px' }}>
            {row.deployedAt && row.deployStartedAt
              ? `Took ${DateTime.fromISO(row.deployStartedAt)
                  .diff(DateTime.fromISO(row.deployedAt))
                  .toFormat('hh:mm:ss')}`
              : null}
          </ListItem>
        </List>
      ),
    },
    {
      title: 'Author',
      field: 'revisionDetails.author',
      render: (row: any): ReactNode => (
        <div>{row.revisionDetails?.author || 'Loading...'}</div>
      ),
    },
    {
      title: 'Message',
      field: 'revisionDetails.message',
      render: (row: any): ReactNode => (
        <div>{row.revisionDetails?.message || 'Loading...'}</div>
      ),
    },
    {
      title: 'Revision',
      field: 'revision',
      render: (row: any): ReactNode => <div>{row.revision}</div>,
    },
  ];

  if (supportsMultipleArgoInstances) {
    columns.splice(1, 0, {
      title: 'Instance',
      field: 'instance',
      render: (row: any): ReactNode =>
        row.metadata?.instance?.name
          ? row.metadata?.instance?.name
          : row.instance,
    });
  }

  return (
    <Table
      title="ArgoCD history"
      options={{
        paging: true,
        search: false,
        draggable: false,
        padding: 'dense',
      }}
      data={data}
      columns={columns}
      actions={[
        {
          icon: () => <SyncIcon />,
          tooltip: 'Refresh',
          isFreeAction: true,
          onClick: () => retry(),
        },
      ]}
    />
  );
};
