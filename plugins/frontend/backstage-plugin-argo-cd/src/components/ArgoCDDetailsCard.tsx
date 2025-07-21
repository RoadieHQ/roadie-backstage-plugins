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

import { ReactNode, useEffect, useState } from 'react';
import {
  Box,
  LinearProgress,
  List,
  ListItem,
  Tooltip,
  Button,
} from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import { DateTime } from 'luxon';
import {
  ARGOCD_ANNOTATION_APP_NAME,
  useArgoCDAppData,
} from './useArgoCDAppData';
import {
  ErrorBoundary,
  InfoCard,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { isArgocdAvailable } from '../conditions';
import { ArgoCDAppDetails, ArgoCDAppList } from '../types';
import { useAppDetails } from './useAppDetails';
import SyncIcon from '@material-ui/icons/Sync';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { DetailsDrawerComponent as detailsDrawerComponent } from './DetailsDrawer';

interface Condition {
  message?: string;
  lastTransitionTime?: string;
  type: string;
}

interface ConditionRow extends Condition {
  key: string;
}

const defaultTableTitle = 'ArgoCD overview';

const MessageComponent = ({
  conditions,
}: {
  conditions: Condition[] | undefined;
}) => {
  const [mapped, setMapped] = useState<ConditionRow[]>([]);

  useEffect(() => {
    setMapped(
      conditions?.map((condition: Condition) => {
        return {
          key: `${condition.lastTransitionTime}-${condition.type}`,
          ...condition,
        };
      }) || [],
    );
  }, [conditions]);

  return (
    <>
      {mapped ? (
        <List dense>
          {mapped.map((condition: ConditionRow) => (
            <ListItem style={{ padding: 0 }} key={condition.key}>
              {condition.message}
            </ListItem>
          ))}
        </List>
      ) : null}
    </>
  );
};

const getElapsedTime = (start: string) => {
  return DateTime.fromISO(start).toRelative();
};

const getLastSyncState = (operationState: any) => {
  return operationState.finishedAt
    ? getElapsedTime(operationState.finishedAt!)
    : operationState.phase;
};

const State = ({
  value,
  conditions,
}: {
  value: string;
  conditions: Condition[] | undefined;
}) => {
  const colorMap: Record<string, string> = {
    Pending: '#dcbc21',
    Synced: 'green',
    Healthy: 'green',
    Inactive: 'black',
    Failed: 'red',
  };
  if (conditions !== undefined) {
    return (
      <Tooltip
        title={<MessageComponent conditions={conditions} />}
        placement="bottom-start"
      >
        <Box display="flex" alignItems="center">
          <Button style={{ paddingLeft: '0px' }}>
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
          </Button>
        </Box>
      </Tooltip>
    );
  }
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
  title: string;
  subtitle: string;
  retry: () => void;
};

const OverviewComponent = ({
  data,
  extraColumns,
  title,
  subtitle,
  retry,
}: OverviewComponentProps) => {
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getOptionalString('argocd.baseUrl');
  const supportsMultipleArgoInstances: boolean = Boolean(
    configApi.getOptionalConfigArray('argocd.appLocatorMethods')?.length,
  );

  const getBaseUrl = (row: any): string | undefined => {
    if (supportsMultipleArgoInstances && !baseUrl) {
      const instanceConfig = configApi
        .getConfigArray('argocd.appLocatorMethods')
        .find(value => value.getOptionalString('type') === 'config')
        ?.getOptionalConfigArray('instances')
        ?.find(
          value =>
            value.getOptionalString('name') === row.metadata?.instance?.name,
        );
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
      highlight: true,
      field: 'name',
      render: (row: any): ReactNode =>
        detailsDrawerComponent(row, getBaseUrl(row)),
      customSort: (a: any, b: any) =>
        a.metadata.name.localeCompare(b.metadata.name),
    },
    {
      title: 'Sync Status',
      field: 'syncStatus',
      render: (row: any): ReactNode => (
        <State
          value={row.status.sync.status}
          conditions={row.status.conditions}
        />
      ),
      customSort: (a: any, b: any) =>
        a.status.sync.status.localeCompare(b.status.sync.status),
    },
    {
      title: 'Health Status',
      field: 'healthStatus',
      render: (row: any): ReactNode => (
        <State value={row.status.health.status} conditions={undefined} />
      ),
      customSort: (a: any, b: any) =>
        a.status.health.status.localeCompare(b.status.health.status),
    },
    {
      title: 'Last Synced',
      defaultSort: 'desc',
      field: 'lastSynced',
      render: (row: any): ReactNode =>
        row.status.operationState
          ? getLastSyncState(row.status.operationState)
          : '',
      customSort: (a: any, b: any) => {
        return (
          DateTime.fromISO(
            a.status.operationState?.finishedAt || '3000-01-01T00:00:00.000Z',
          ).toMillis() -
          DateTime.fromISO(
            b.status.operationState?.finishedAt || '3000-01-01T00:00:00.000Z',
          ).toMillis()
        );
      },
    },
  ];

  if (supportsMultipleArgoInstances) {
    columns.splice(1, 0, {
      title: 'Instance',
      field: 'instance',
      render: (row: any): ReactNode => row.metadata?.instance?.name,
      customSort: (a: any, b: any) =>
        a.metadata?.instance?.name.localeCompare(b.metadata?.instance?.name),
    });
  }

  return (
    <Table
      title={title ?? defaultTableTitle}
      subtitle={subtitle}
      options={{
        paging: true,
        search: false,
        sorting: true,
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
  title,
  subtitle,
}: {
  entity: Entity;
  extraColumns: TableColumn[];
  title?: string;
  subtitle?: string;
}) => {
  const { url, appName, appSelector, appNamespace, projectName } =
    useArgoCDAppData({
      entity,
    });
  const { loading, value, error, retry } = useAppDetails({
    url,
    appName,
    appSelector,
    appNamespace,
    projectName,
  });
  if (loading) {
    return (
      <InfoCard title={title ?? defaultTableTitle} subheader={subtitle}>
        <LinearProgress />
      </InfoCard>
    );
  }
  if (error) {
    return (
      <InfoCard title={title ?? defaultTableTitle} subheader={subtitle}>
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
          title={title ?? defaultTableTitle}
          subtitle={subtitle ?? ''}
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
          title={title ?? defaultTableTitle}
          subtitle={subtitle ?? ''}
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
        title={title ?? defaultTableTitle}
        subtitle={subtitle ?? ''}
      />
    );
  }
  return null;
};

type Props = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
  extraColumns?: TableColumn[];
  title?: string;
  subtitle?: string;
};

export const ArgoCDDetailsCard = (props: Props) => {
  const { entity } = useEntity();
  return !isArgocdAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={ARGOCD_ANNOTATION_APP_NAME} />
  ) : (
    <ErrorBoundary>
      <ArgoCDDetails
        entity={entity}
        extraColumns={props.extraColumns || []}
        title={props.title}
        subtitle={props.subtitle}
      />
    </ErrorBoundary>
  );
};
