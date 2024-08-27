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
import { useAsync } from 'react-use';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import {
  ErrorPanel,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';

type EntityLaunchdarklyOverviewCardProps = {};

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

export const EntityLaunchdarklyOverviewCard = (
  _: EntityLaunchdarklyOverviewCardProps,
) => {
  const { entity } = useEntity();
  const discovery = useApi(discoveryApiRef);
  const unsetAnnotations = difference(
    [
      LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
      LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION,
      LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
    ],
    Object.keys(entity.metadata?.annotations || {}),
  );

  const { value, error, loading } = useAsync(async () => {
    const projectKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_PROJECT_KEY_ANNOTATION];
    const environmentKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION];
    const cntxt =
      entity.metadata.annotations?.[LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION];

    if (projectKey && environmentKey && cntxt) {
      const url = `${await discovery.getBaseUrl('proxy')}/launchdarkly/api`;
      const response = await fetch(
        `${url}/v2/projects/${projectKey}/environments/${environmentKey}/flags/evaluate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: cntxt,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to retrieve launchdarkly environment ${environmentKey}: ${response.statusText}`,
        );
      }

      return (await response.json()).items;
    }
    return undefined;
  });

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
      title="Feature flags from LaunchDarkly"
      columns={columns}
      data={value}
      options={{
        paging: true,
        search: false,
        draggable: false,
        padding: 'dense',
      }}
    />
  );
};
