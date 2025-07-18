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

import { Entity } from '@backstage/catalog-model';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { SeverityChart } from './SeverityChart';
import { IssuesProvider } from '../IssuesContext';

export const WIZ_PROJECT_ANNOTATION = 'wiz.io/project-id';

export const isWizAvailable = (entity: Entity) => {
  return Boolean(entity?.metadata.annotations?.[WIZ_PROJECT_ANNOTATION]);
};
export const EntitySeverityChart = () => {
  const { entity } = useEntity();
  return !isWizAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={WIZ_PROJECT_ANNOTATION} />
  ) : (
    <IssuesProvider>
      <SeverityChart />
    </IssuesProvider>
  );
};
