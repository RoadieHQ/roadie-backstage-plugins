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

import { Entity } from '@backstage/catalog-model';
import {
  InfoCard,
  ErrorBoundary,
  MissingAnnotationEmptyState,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { LinearProgress, Link, List, ListItem } from '@material-ui/core';
import React from 'react';
import { isArgocdAvailable } from '../conditions';
import { ArgoCDAppDetails, ArgoCDAppList } from '../types';
import { useAppDetails } from './useAppDetails';
import {
  ARGOCD_ANNOTATION_APP_NAME,
  useArgoCDAppData,
} from './useArgoCDAppData';
import SyncIcon from '@material-ui/icons/Sync';
import moment from 'moment';

const HistoryTable = ({
  data,
  retry,
}: {
  data: ArgoCDAppList;
  retry: () => void;
}) => {
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getOptionalString('argocd.baseUrl');
  const supportsMultipleArgoInstances: boolean = Boolean(
    configApi.getOptionalConfigArray('argocd.appLocatorMethods')?.length,
  );

  const history = data.items
    ? data.items
        .map(app => {
          if (typeof app.status.history !== 'undefined') {
            return app.status.history.map(entry => {
              return {
                app: app.metadata.name,
                instance: app.metadata?.instance?.name,
                ...entry,
              };
            });
          }
          return {};
        })
        .filter(value => Object.keys(value).length !== 0)
        .flat()
    : [];
  const columns: TableColumn[] = [
    {
      title: 'Name',
      field: 'name',
      render: (row: any): React.ReactNode =>
        baseUrl ? (
          <Link
            href={`${baseUrl}/applications/${row.app}`}
            target="_blank"
            rel="noopener"
          >
            {row.app}
          </Link>
        ) : (
          row.app
        ),
      highlight: true,
    },
    {
      title: 'Deploy Details',
      sorting: false,
      render: (row: any): React.ReactNode => (
        <List dense style={{ padding: '0px' }}>
          <ListItem style={{ paddingLeft: '0px' }}>
            {row.deployedAt
              ? `Deployed at ${moment(row.deployedAt)
                  .local()
                  .format('DD MMM YYYY, H:mm:ss')}`
              : null}
          </ListItem>
          <ListItem style={{ paddingLeft: '0px' }}>
            {row.deployedAt
              ? `Run ${moment(row.deployStartedAt).local().fromNow()}`
              : null}
          </ListItem>
          <ListItem style={{ paddingLeft: '0px' }}>
            {row.deployedAt && row.deployStartedAt
              ? `Took
            ${moment
              .duration(
                moment(row.deployStartedAt).diff(moment(row.deployedAt)),
              )
              .humanize()}`
              : null}
          </ListItem>
        </List>
      ),
    },
    {
      title: 'Author',
      sorting: false,
      render: (row: any): React.ReactNode => <div>{row.revision?.author}</div>,
    },
    {
      title: 'Message',
      sorting: false,
      render: (row: any): React.ReactNode => <div>{row.revision?.message}</div>,
    },
    {
      title: 'Revision',
      sorting: false,
      render: (row: any): React.ReactNode => (
        <div>{row.revision?.revisionID}</div>
      ),
    },
  ];

  if (supportsMultipleArgoInstances) {
    columns.splice(1, 0, {
      title: 'Instance',
      render: (row: any): React.ReactNode =>
        row.metadata?.instance?.name
          ? row.metadata?.instance?.name
          : row.instance,
    });
  }

  return (
    <Table
      title="ArgoCD history"
      options={{
        paging: false,
        search: false,
        draggable: false,
        padding: 'dense',
      }}
      data={history}
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

const ArgoCDHistory = ({ entity }: { entity: Entity }) => {
  const { url, appName, appSelector, projectName } = useArgoCDAppData({
    entity,
  });
  const { loading, value, error, retry } = useAppDetails({
    url,
    appName,
    appSelector,
    projectName,
  });
  if (loading) {
    return (
      <InfoCard title="ArgoCD history">
        <LinearProgress />
      </InfoCard>
    );
  }
  if (error) {
    return (
      <InfoCard title="ArgoCD history">
        Error occurred while fetching data. {error.message}
      </InfoCard>
    );
  }

  if (value) {
    if ((value as ArgoCDAppList).items !== undefined) {
      return <HistoryTable data={value as ArgoCDAppList} retry={retry} />;
    }
    if (Array.isArray(value)) {
      const wrapped: ArgoCDAppList = {
        items: value as Array<ArgoCDAppDetails>,
      };
      return <HistoryTable data={wrapped} retry={retry} />;
    }
    const wrapped: ArgoCDAppList = {
      items: [value as ArgoCDAppDetails],
    };
    return <HistoryTable data={wrapped} retry={retry} />;
  }

  return null;
};

export const ArgoCDHistoryCard = () => {
  const { entity } = useEntity();
  return !isArgocdAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={ARGOCD_ANNOTATION_APP_NAME} />
  ) : (
    <ErrorBoundary>
      <ArgoCDHistory entity={entity} />
    </ErrorBoundary>
  );
};
