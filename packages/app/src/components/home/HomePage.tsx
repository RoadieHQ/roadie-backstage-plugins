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

import React from 'react';
import Grid from '@material-ui/core/Grid';
import { HomePageToolkit } from '@backstage/plugin-home';
import { HomePageMarkdown } from '@roadiehq/backstage-plugin-home-markdown';

export const HomePage = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <HomePageToolkit
          tools={[
            {
              label: 'Backstage',
              url: 'https://github.com/backstage/backstage',
              icon: <></>,
            },
          ]}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <HomePageMarkdown
          title="Neeews!"
          owner="RoadieHQ"
          repo="roadie-backstage-plugins"
          path=".backstage/home-page.md"
          branch="SC-7064-add-markdown-home-plugin"
        />
      </Grid>
    </Grid>
  );
};
