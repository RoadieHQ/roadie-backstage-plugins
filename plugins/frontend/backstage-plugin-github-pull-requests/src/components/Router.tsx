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
import { Route, Routes } from 'react-router';
import PullRequestsPage from './PullRequestsPage';
import {
  GITHUB_PULL_REQUESTS_ANNOTATION,
  GITHUB_PULL_REQUESTS_TEAM_ANNOTATION,
} from '../utils/isGithubSlugSet';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

export const isGithubPullRequestsAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[GITHUB_PULL_REQUESTS_ANNOTATION]);

export const isGithubTeamPullRequestsAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[GITHUB_PULL_REQUESTS_TEAM_ANNOTATION]);

export const Router = () => {
  const { entity } = useEntity();
  return !isGithubPullRequestsAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={GITHUB_PULL_REQUESTS_ANNOTATION} />
  ) : (
    <Routes>
      <Route path="/" element={<PullRequestsPage />} />
    </Routes>
  );
};
