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

import { useEntity } from "@backstage/plugin-catalog-react";

export const TRAVIS_ANNOTATION = 'travis-ci.com/repo-slug';

export const useTravisRepoData = () => {
  const { entity } = useEntity();
  const travisSlug = entity?.metadata.annotations?.[TRAVIS_ANNOTATION] ?? '';
  if (!travisSlug) {
    throw new Error("'travis-ci.com/repo-slug' annotation is missing");
  }
  const slugElements = travisSlug.split('/').map(p => p.trim());
  if (slugElements.length < 2) {
    throw new Error("'travis-ci.com/repo-slug' annotation is missing");
  }
  return travisSlug;
};
