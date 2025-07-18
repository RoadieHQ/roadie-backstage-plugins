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
import { GITHUB_REPO_ANNOTATION } from '../useProjectName';
import { DependabotAlertsTable } from '../DependabotAlertsTable';
import { useEntity } from '@backstage/plugin-catalog-react';

export const GithubDependabotTab = () => {
  const { entity } = useEntity();

  const isSecurityInsightsAvailable = () =>
    Boolean(entity.metadata.annotations?.[GITHUB_REPO_ANNOTATION]);

  return !isSecurityInsightsAvailable() ? (
    <MissingAnnotationEmptyState annotation={GITHUB_REPO_ANNOTATION} />
  ) : (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="Dependabot Alerts">
          <SupportButton>Plugin to show Dependabot Alerts</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <DependabotAlertsTable />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
