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

import { Entity } from '@backstage/catalog-model';
import { Routes, Route } from 'react-router-dom';
import { TravisCIBuildsPage } from './components/TravisCiBuildsPage';
import { TRAVIS_ANNOTATION } from './hooks/useTravisRepoData';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

export const isTravisciAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[TRAVIS_ANNOTATION]);

export const Router = () => {
  const { entity } = useEntity();
  return !isTravisciAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={TRAVIS_ANNOTATION} />
  ) : (
    <Routes>
      <Route path="/" element={<TravisCIBuildsPage entity={entity} />} />
    </Routes>
  );
};
