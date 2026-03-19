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

import Grid from '@material-ui/core/Grid';
import { HomePageToolkit } from '@backstage/plugin-home';
import { HomePageMarkdown } from '@roadiehq/backstage-plugin-home-markdown';
import { HomePageRSS } from '@roadiehq/backstage-plugin-home-rss';
import { CloudsmithStatsCard } from '@roadiehq/backstage-plugin-cloudsmith';
import {
  HomePageRequestedReviewsCard,
  HomePageYourOpenPullRequestsCard,
} from '@roadiehq/backstage-plugin-github-pull-requests';
import { Content, PageWithHeader } from '@backstage/core-components';
import { HomepageStoriesCard } from '@roadiehq/backstage-plugin-shortcut';
import { HomePageIFrameCard } from '@roadiehq/backstage-plugin-iframe';
import { HomePageMyJiraTicketsCard } from '@roadiehq/backstage-plugin-jira';

export const HomePage = () => {
  return (
    <PageWithHeader title="Home" themeId="home">
      <Content>
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <HomePageRequestedReviewsCard />
          </Grid>
          <Grid item md={6} xs={12}>
            <HomePageYourOpenPullRequestsCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <CloudsmithStatsCard repo="roadie-npm" owner="roadie" />
          </Grid>
          <Grid item md={6} xs={12}>
            <HomepageStoriesCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <HomePageRSS
              feedURL="http://localhost:7007/api/proxy/reuters-news-feed/?best-topics=tech&post_type=best"
              title="Reuters News"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <HomePageMarkdown
              title="Neeews!"
              owner="RoadieHQ"
              repo="roadie-backstage-plugins"
              path=".backstage/home-page.md"
            />
          </Grid>
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
            <HomePageIFrameCard
              title="Super cool title"
              src="https://example.com"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <HomePageMyJiraTicketsCard userId="roadie" />
          </Grid>
        </Grid>
      </Content>
    </PageWithHeader>
  );
};
