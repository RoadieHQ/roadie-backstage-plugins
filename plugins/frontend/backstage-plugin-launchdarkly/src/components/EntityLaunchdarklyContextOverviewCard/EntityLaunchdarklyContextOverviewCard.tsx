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
import React from 'react';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import {
  LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
  LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION,
  LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
} from '../../constants';
import difference from 'lodash/difference';
import {
  ErrorPanel,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useLaunchdarklyContextFlags } from '../../hooks/useLaunchdarklyContextFlags';

export type EntityLaunchdarklyOverviewCardProps = {
  title?: string;
  enableSearch?: boolean;
};

const columns: Array<TableColumn> = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Value',
    field: '_value',
  },
];

export const EntityLaunchdarklyContextOverviewCard = (
  props: EntityLaunchdarklyOverviewCardProps,
) => {
  const { title, enableSearch = false } = props;
  const { entity } = useEntity();
  const unsetAnnotations = difference(
    [
      LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
      LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION,
      LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
    ],
    Object.keys(entity.metadata?.annotations || {}),
  );

  const { value, error, loading } = useLaunchdarklyContextFlags(entity);

  if (unsetAnnotations.length > 0) {
    return (
      <MissingAnnotationEmptyState
        annotation={unsetAnnotations[0]}
        readMoreUrl="https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/plugins/frontend/backstage-plugin-launchdarkly/README.md"
      />
    );
  }

  if (loading) {
    return <Progress />;
  }

  if (error && error.message) {
    return <ErrorPanel error={error} />;
  }

  return (
    <Table
      title={title || 'Feature flags from LaunchDarkly'}
      columns={columns}
      data={value}
      options={{
        paging: true,
        search: enableSearch,
        draggable: false,
        padding: 'dense',
      }}
    />
  );
};
