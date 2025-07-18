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

import { Routes, Route } from 'react-router-dom';
import { ARGOCD_ANNOTATION_APP_NAME } from './components/useArgoCDAppData';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ArgoCDHistoryCard } from './components/ArgoCDHistoryCard';
import { isArgocdAvailable } from './conditions';

export const Router = () => {
  const { entity } = useEntity();
  return !isArgocdAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={ARGOCD_ANNOTATION_APP_NAME} />
  ) : (
    <Routes>
      <Route path="/" element={<ArgoCDHistoryCard />} />
    </Routes>
  );
};
