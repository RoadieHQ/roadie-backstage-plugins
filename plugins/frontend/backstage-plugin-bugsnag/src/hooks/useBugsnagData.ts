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

export const BUGSNAG_ANNOTATION = 'bugsnag.com/project-key';
export const PROJECT_ANNOTATION = 'bugsnag.com/project-name';

export const useBugsnagData = () => {
  const { entity } = useEntity();
  const bugsnagSlug = entity?.metadata.annotations?.[BUGSNAG_ANNOTATION] ?? '';
  if (!bugsnagSlug) {
    throw new Error("'bugsnag.com/project-key' annotation is missing");
  }
  const slugElements = bugsnagSlug.split('/').map(p => p.trim());
  if (slugElements.length < 2) {
    throw new Error("'bugsnag.com/project-key' annotation is missing");
  }
  return slugElements;
};

export const useProjectName = () => {
  const { entity } = useEntity();
  const projectNameSlug = entity?.metadata.annotations?.[PROJECT_ANNOTATION] ?? '';
  return projectNameSlug;
};
