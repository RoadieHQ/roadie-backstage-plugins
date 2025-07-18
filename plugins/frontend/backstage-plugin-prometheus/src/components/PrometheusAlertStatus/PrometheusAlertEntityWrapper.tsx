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

import { MissingAnnotationEmptyState } from '@backstage/plugin-catalog-react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { TableColumn } from '@backstage/core-components';
import {
  isPrometheusAlertAvailable,
  PROMETHEUS_ALERT_ANNOTATION,
  PROMETHEUS_PLUGIN_DOCUMENTATION,
} from '../util';
import { PrometheusAlertStatus } from './PrometheusAlertStatus';
import { OnRowClick, PrometheusDisplayableAlert } from '../../types';

export const PrometheusAlertEntityWrapper = ({
  extraColumns,
  onRowClick,
  showAnnotations = true,
  showLabels = true,
}: {
  extraColumns?: TableColumn<PrometheusDisplayableAlert>[];
  onRowClick?: OnRowClick;
  showAnnotations?: boolean;
  showLabels?: boolean;
}) => {
  const { entity } = useEntity();
  const alertContent = isPrometheusAlertAvailable(entity);
  if (!alertContent) {
    return (
      <MissingAnnotationEmptyState
        annotation={PROMETHEUS_ALERT_ANNOTATION}
        readMoreUrl={PROMETHEUS_PLUGIN_DOCUMENTATION}
      />
    );
  }
  const alerts = alertContent
    ? entity.metadata.annotations!![PROMETHEUS_ALERT_ANNOTATION].split(',')
    : [];

  return alerts.length > 0 && alerts[0] === 'all' ? (
    <PrometheusAlertStatus
      alerts="all"
      onRowClick={onRowClick}
      extraColumns={extraColumns}
      showAnnotations={showAnnotations}
      showLabels={showLabels}
    />
  ) : (
    <PrometheusAlertStatus
      alerts={alerts}
      onRowClick={onRowClick}
      extraColumns={extraColumns}
      showAnnotations={showAnnotations}
      showLabels={showLabels}
    />
  );
};
