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

import { Grid } from '@material-ui/core';
import {
  Page,
  Content,
  ContentHeader,
  SupportButton,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { SecurityInsightsTable } from '../SecurityInsightsTable';
import { GITHUB_REPO_ANNOTATION } from '../useProjectName';
import { useEntity } from '@backstage/plugin-catalog-react';
import type { Entity } from '@backstage/catalog-model';

export const isSecurityInsightsAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[GITHUB_REPO_ANNOTATION]);

export const SecurityInsightsTab = () => {
  const { entity } = useEntity();
  if (!isSecurityInsightsAvailable(entity)) {
    return <MissingAnnotationEmptyState annotation={GITHUB_REPO_ANNOTATION} />;
  }

  return (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="Security Insights">
          <SupportButton>Plugin to show Security Insights</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <SecurityInsightsTable />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
