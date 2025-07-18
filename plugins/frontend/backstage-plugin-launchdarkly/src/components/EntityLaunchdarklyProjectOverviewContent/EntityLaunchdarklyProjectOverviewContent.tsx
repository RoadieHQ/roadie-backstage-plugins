/*
 * Copyright 2024 Larder Software Limited
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
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Content,
  ContentHeader,
  ErrorPanel,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  ProjectFlag,
  useLaunchdarklyProjectFlags,
} from '../../hooks/useLaunchdarklyProjectFlags';
import { DateTime } from 'luxon';

export type EntityLaunchdarklyProjectOverviewContentProps = {
  title?: string;
  enableSearch?: boolean;
};

const columns: Array<TableColumn<ProjectFlag>> = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Maintainer',
    field: '_maintainer.email',
  },
  {
    title: 'Kind',
    field: 'kind',
  },
  {
    title: 'Created',
    render: row => {
      return DateTime.fromSeconds(row.creationDate / 1000).toLocaleString(
        DateTime.DATETIME_MED,
      );
    },
    field: 'creationDate',
    sorting: true,
  },
  {
    title: 'Version',
    field: '_version',
  },
];

export const EntityLaunchdarklyProjectOverviewContent = (
  props: EntityLaunchdarklyProjectOverviewContentProps,
) => {
  const { title, enableSearch = true } = props;
  const { entity } = useEntity();

  const { value, error, loading } = useLaunchdarklyProjectFlags(entity);

  if (loading) {
    return <Progress />;
  }

  if (error && error.message) {
    return <ErrorPanel error={error} />;
  }

  if (!value) {
    return <ErrorPanel error={new Error('Failed to retrieve project flags')} />;
  }

  return (
    <Content>
      <ContentHeader title={title || 'Feature flags from LaunchDarkly'} />
      <Table
        columns={columns}
        data={value}
        options={{
          paging: true,
          search: enableSearch,
          draggable: false,
          padding: 'dense',
          pageSize: Math.min(value.length, 40),
        }}
      />
    </Content>
  );
};
