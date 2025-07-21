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

import { Route, Routes } from 'react-router';
import { Entity } from '@backstage/catalog-model';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import BuildkiteBuildsTable from './BuildKiteBuildsTable';
import BuildkiteBuildView from './BuildKiteBuildView';
import {
  BUILDKITE_ANNOTATION,
  BUILDKITE_DEFAULT_BRANCH_ONLY_ANNOTATION,
} from '../consts';
import { useEntity } from '@backstage/plugin-catalog-react';
import { buildKiteBuildRouteRef } from '../plugin';

export const isBuildkiteAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[BUILDKITE_ANNOTATION]);

export type RouterProps = {
  defaultBranchOnly?: boolean;
};

export const Router = (props: RouterProps) => {
  let { defaultBranchOnly } = props;
  const { entity } = useEntity();
  if (!isBuildkiteAvailable(entity)) {
    return <MissingAnnotationEmptyState annotation={BUILDKITE_ANNOTATION} />;
  }

  const defaultBranchOnlyAnnotation = Boolean(
    entity?.metadata.annotations?.[BUILDKITE_DEFAULT_BRANCH_ONLY_ANNOTATION],
  );

  if (defaultBranchOnlyAnnotation) {
    defaultBranchOnly = true;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <BuildkiteBuildsTable
            defaultBranchOnly={defaultBranchOnly}
            entity={entity}
          />
        }
      />

      <Route
        path={`/${buildKiteBuildRouteRef.path}`}
        element={<BuildkiteBuildView entity={entity} />}
      />
    </Routes>
  );
};
