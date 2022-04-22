/*
 * Copyright 2022 Larder Software Limited
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

export const PROJECT_ANNOTATION = 'shortcut.com/project-id';

export const useShortcutData = () => {
  const { entity } = useEntity();
  const shortcutSlug = entity?.metadata.annotations?.[PROJECT_ANNOTATION] ?? '';
  if (!shortcutSlug) {
    throw new Error("'shortcut.com/project-id' annotation is missing");
  }
  const slugElements = shortcutSlug.split('/').map(p => p.trim());
  if (slugElements.length < 2) {
    throw new Error("'shortcut.com/project-id' annotation is missing");
  }
  return slugElements;
};

export const useProjectId = () => {
  const { entity } = useEntity();
  const projectIdSlug =
    entity?.metadata.annotations?.[PROJECT_ANNOTATION] ?? '';
  return projectIdSlug;
};
