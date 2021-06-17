/*
 * Copyright 2020 RoadieHQ
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

import React, { FC } from 'react';
import { Grid } from '@material-ui/core';
import {
  Page,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core';
import { PullRequestsTable } from '../PullRequestsTable';
import { Entity } from '@backstage/catalog-model';

const PullRequestsPage: FC<{ entity: Entity }> = ({ entity }) => (
  <Page themeId="tool">
    <Content>
      <ContentHeader title="Pull requests plugin">
        <SupportButton>
          Plugin to show a project's pull requests on GitHub
        </SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <PullRequestsTable entity={entity} />
        </Grid>
      </Grid>
    </Content>
  </Page>
);

export default PullRequestsPage;
