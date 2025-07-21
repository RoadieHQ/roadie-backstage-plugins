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

import { useEntity } from '@backstage/plugin-catalog-react';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { Route, Routes } from 'react-router';
import { DatadogDashboardPage } from './components/DatadogDashboardPage';
import { DATADOG_ANNOTATION_DASHBOARD_URL } from './components/useDatadogAppData';
import { isDatadogDashboardAvailable } from './plugin';

/**
 * @deprecated since v0.2.0 you should use new composability API
 */
export const Router = () => {
  const { entity } = useEntity();
  return !isDatadogDashboardAvailable(entity) ? (
    <MissingAnnotationEmptyState
      annotation={DATADOG_ANNOTATION_DASHBOARD_URL}
    />
  ) : (
    <Routes>
      <Route path="/" element={<DatadogDashboardPage entity={entity} />} />
    </Routes>
  );
};
