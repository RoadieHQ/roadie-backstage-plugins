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

import { ErrorPanel, Table, TableColumn, Link } from '@backstage/core-components';
import SyncIcon from '@material-ui/icons/Sync';
import { shortcutApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsyncRetry } from 'react-use';
import { useEntity } from '@backstage/plugin-catalog-react';
import { SHORTCUT_QUERY_ANNOTATION } from '../../constants';
import { Story, User } from '../../api/types';

const columnsBuilder: (users?: User[]) => TableColumn<Story>[] = (
  users?: User[],
) => [
  {
    title: 'Name',
    render: story => <Link to={story.app_url}>{story.name}</Link>,
  },
  {
    title: 'Status',
    render: story => (story.started ? <>In progress</> : <>'Not started'</>),
  },
  {
    title: 'Owners',
    render: story => {
      return users
        ?.filter(user => story.owner_ids.includes(user.id))
        .map(user => user.profile.name)
        .join(', ');
    },
  },
];

export const EntityStoriesCard = (props: {
  title?: string;
  additionalQuery?: string;
}) => {
  const shortcutApi = useApi(shortcutApiRef);
  const { entity } = useEntity();

  const {
    value: data,
    retry,
    error,
    loading,
  } = useAsyncRetry(async () => {
    let query = entity.metadata.annotations?.[SHORTCUT_QUERY_ANNOTATION];
    if (props.additionalQuery) {
      query = [query, props.additionalQuery]
        .filter(queryItem => queryItem !== undefined)
        .join(' ');
    }
    if (query) {
      return (await shortcutApi.fetchStories({ query })).data;
    }
    return [];
  });

  const { value: users } = useAsyncRetry(async () => {
    return shortcutApi.getUsers();
  });

  if (error) {
    return <ErrorPanel error={error} />;
  }
  return (
    <Table
      title={props.title ? props.title : 'Shortcut Stories'}
      options={{
        paging: true,
        search: false,
        sorting: true,
        draggable: false,
        padding: 'dense',
      }}
      isLoading={loading}
      data={data || []}
      columns={columnsBuilder(users)}
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
