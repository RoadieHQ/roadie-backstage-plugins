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
import {
  GITHUB_INSIGHTS_ANNOTATION,
  isGithubInsightsAvailable,
} from '../utils/isGithubInsightsAvailable';
import {
  ComplianceCard,
  ContributorsCard,
  ReadMeCard,
  LanguagesCard,
  ReleasesCard,
  EnvironmentsCard,
} from '../Widgets';
import { useEntity } from '@backstage/plugin-catalog-react';

export const InsightsPage = () => {
  const { entity } = useEntity();

  return isGithubInsightsAvailable(entity) ? (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="GitHub Insights">
          <SupportButton>Plugin to show GitHub Insights</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="row" alignItems="stretch">
          <Grid item sm={12} md={6} lg={4}>
            <ContributorsCard />
            <LanguagesCard />
            <ReleasesCard />
            <EnvironmentsCard />
            <ComplianceCard />
          </Grid>
          <Grid item sm={12} md={6} lg={8}>
            <ReadMeCard maxHeight={450} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  ) : (
    <MissingAnnotationEmptyState annotation={GITHUB_INSIGHTS_ANNOTATION} />
  );
};
