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
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
  LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
} from '../../constants';
import difference from 'lodash/difference';
import {
  ErrorBoundary,
  ErrorPanel,
  Link,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';

import {
  ContextFlag,
  useLaunchdarklyContextFlags,
} from '../../hooks/useLaunchdarklyContextFlags';
import { FlagDetailsPanel } from './FlagDetailsPanel';
import { ValueRenderer } from './FlagVariationValueRenderer';

export type EntityLaunchdarklyOverviewCardProps = {
  title?: string;
  enableSearch?: boolean;
};

const columns: Array<TableColumn<ContextFlag>> = [
  {
    title: 'Name',
    field: 'name',
    render: row => (
      <Link to={row.link} target="_blank">
        {row.name}
      </Link>
    ),
  },
  {
    title: 'Key',
    field: 'key',
  },
  {
    title: 'Description',
    field: 'description',
    render: row => (
      <span style={{ fontSize: '0.875rem' }}>
        {row.description || 'No description'}
      </span>
    ),
  },
  {
    title: 'Status',
    field: 'status',
    render: row => {
      const statuses = Array.isArray(row.status) ? row.status : [row.status];

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {statuses.map((status, index) => {
            let color = 'gray';
            if (status.includes('Enabled')) {
              color = 'green';
            } else if (status.includes('Disabled')) {
              color = 'red';
            }
            return (
              <span key={index} style={{ color, fontSize: '0.875rem' }}>
                {status}
              </span>
            );
          })}
        </div>
      );
    },
  },
  {
    title: 'Tags',
    field: 'tags',
    render: row => {
      if (!row.tags || row.tags.length === 0) {
        return (
          <span style={{ color: 'gray', fontSize: '0.875rem' }}>None</span>
        );
      }
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {row.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                fontSize: '0.75rem',
                padding: '2px 6px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                color: '#616161',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    title: 'Variations',
    render: row =>
      row.variations ? <ValueRenderer value={row.variations} /> : 'N/A',
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
      data={value ?? []}
      detailPanel={({ rowData }) => (
        <ErrorBoundary>
          <FlagDetailsPanel flag={rowData} />
        </ErrorBoundary>
      )}
      options={{
        paging: true,
        search: enableSearch,
        draggable: false,
        padding: 'dense',
      }}
    />
  );
};
