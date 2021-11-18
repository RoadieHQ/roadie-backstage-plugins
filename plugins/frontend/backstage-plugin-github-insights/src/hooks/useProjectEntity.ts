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

const GITHUB_PROJECT_ANNOTATION = 'github.com/project-slug';
const GITHUB_README_ANNOTATION = 'github.com/project-readme-path';

export const useProjectEntity = (entity: Entity) => {
  const projectSlug = entity.metadata?.annotations?.[
    GITHUB_PROJECT_ANNOTATION
  ] as string;

  const readmePath = entity.metadata?.annotations?.[
    GITHUB_README_ANNOTATION
  ] as string;

  if(!projectSlug && projectSlug === ''){
    throw new Error(`No "${GITHUB_PROJECT_ANNOTATION}" annotation found for your entity ${entity.metadata.name}`)
  }

  return {
    owner: projectSlug?.split("/")[0] || '',
    repo: projectSlug?.split("/")[1] || '',
    readmePath,
  };
};
