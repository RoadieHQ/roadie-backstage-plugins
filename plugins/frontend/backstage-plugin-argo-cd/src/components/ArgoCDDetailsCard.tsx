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
import { Box, LinearProgress } from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import moment from 'moment';
import {
  ARGOCD_ANNOTATION_APP_NAME,
  useArgoCDAppData,
} from './useArgoCDAppData';
import {
  InfoCard,
  MissingAnnotationEmptyState,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import ErrorBoundary from './ErrorBoundary';
import { isArgocdAvailable } from '../Router';
import { ArgoCDAppDetails, ArgoCDAppList } from '../types';
import { useAppDetails } from './useAppDetails';
import SyncIcon from '@material-ui/icons/Sync';
import { useEntity } from '@backstage/plugin-catalog-react';
import { DetailsDrawerComponent as detailsDrawerComponent } from './DetailsDrawer';

const getElapsedTime = (start: string) => {
  return moment(start).fromNow();
};

const State = ({ value }: { value: string }) => {
  const colorMap: Record<string, string> = {
    Pending: '#dcbc21',
    Synced: 'green',
    Healthy: 'green',
    Inactive: 'black',
    Failed: 'red',
  };
  return (
    <Box display="flex" alignItems="center">
      <span
        style={{
          display: 'block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: colorMap[value] || '#dcbc21',
          marginRight: '5px',
        }}
      />
      {value}
    </Box>
  );
};

type OverviewComponentProps = {
  data: ArgoCDAppList;
  extraColumns: TableColumn[];
  retry: () => void;
};

const OverviewComponent = ({
  data,
  extraColumns,
  retry,
}: OverviewComponentProps) => {
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getOptionalString('argocd.baseUrl');
  const supportsMultipleArgoInstances: boolean = Boolean(configApi.getOptionalConfigArray('argocd.appLocatorMethods')?.length);

  const columns: TableColumn[] = [
    {
      title: 'Name',
      highlight: true,
      render: (row: any): React.ReactNode => detailsDrawerComponent(row, baseUrl)
    },
    {
      title: 'Sync Status',
      render: (row: any): React.ReactNode => (
        <State value={row.status.sync.status} />
      ),
    },
    {
      title: 'Health Status',
      render: (row: any): React.ReactNode => (
        <State value={row.status.health.status} />
      ),
    },
    {
      title: 'Last Synced',
      render: (row: any): React.ReactNode =>
        row.status.operationState
          ? getElapsedTime(row.status.operationState.finishedAt!)
          : '',
    },
  ];

  if (supportsMultipleArgoInstances) {
    columns.splice(1, 0, {
      title: 'Instance',
      render: (row: any): React.ReactNode => row.metadata?.instance?.name,
    })
  }

  return (
    <Table
      title="ArgoCD overview"
      options={{
        paging: false,
        search: false,
        sorting: false,
        draggable: false,
        padding: 'dense',
      }}
      data={data.items || []}
      columns={columns.concat(extraColumns)}
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

const ArgoCDDetails = ({
  entity,
  extraColumns,
}: {
  entity: Entity;
  extraColumns: TableColumn[];
}) => {
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
      <InfoCard title="ArgoCD overview">
        <LinearProgress />
      </InfoCard>
    );
  }
  if (error) {
    return (
      <InfoCard title="ArgoCD overview">
        Error occurred while fetching data. {error.name}: {error.message}
      </InfoCard>
    );
  }
  if (value) {
    if ((value as ArgoCDAppList).items !== undefined) {
      return (
        <OverviewComponent
          data={value as ArgoCDAppList}
          retry={retry}
          extraColumns={extraColumns}
        />
      );
    }
    if (Array.isArray(value)) {
      const wrapped: ArgoCDAppList = {
        items: value as Array<ArgoCDAppDetails>,
      };
      return (
        <OverviewComponent
          data={wrapped}
          retry={retry}
          extraColumns={extraColumns}
        />
      );
    }
    const wrapped: ArgoCDAppList = {
      items: [value as ArgoCDAppDetails],
    };
    return (
      <OverviewComponent
        data={wrapped}
        retry={retry}
        extraColumns={extraColumns}
      />
    );
  }
  return null;
};

type Props = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
  extraColumns?: TableColumn[];
};

export const ArgoCDDetailsCard = (props: Props) => {
  const { entity } = useEntity();
  return !isArgocdAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={ARGOCD_ANNOTATION_APP_NAME} />
  ) : (
    <ErrorBoundary>
      <ArgoCDDetails entity={entity} extraColumns={props.extraColumns || []} />
    </ErrorBoundary>
  );
};
