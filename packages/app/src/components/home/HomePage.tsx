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
import { HomePageToolkit, HomePageCompanyLogo } from '@backstage/plugin-home';
import { HomePageMarkdown } from '@roadiehq/backstage-plugin-home-markdown';
import { HomePageRSS } from '@roadiehq/backstage-plugin-home-rss';
import {
  HomePageRequestedReviewsCard,
  HomePageYourOpenPullRequestsCard,
} from '@roadiehq/backstage-plugin-github-pull-requests';
import { Content, Page } from '@backstage/core-components';
import { HomepageStoriesCard } from '@roadiehq/backstage-plugin-shortcut';
import { HomePageIFrameCard } from '@roadiehq/backstage-plugin-iframe';
import { HomePageSearchBar as SearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  searchBar: {
    display: 'flex',
    maxWidth: '60vw',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    padding: '8px 0',
    borderRadius: '50px',
    margin: 'auto',
  },
}));

export const HomePageSearchBar = () => {
  const styles = useStyles();
  return (
    <Grid xs={12}>
      <SearchContextProvider>
        <SearchBar className={styles.searchBar} classes={{ root: '' }} />
      </SearchContextProvider>
    </Grid>
  );
};

export const HomePage = () => {
  return (
    <Page themeId="home">
      <Content>
        <Grid container spacing={6}>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <Grid item md={12} xs={12}>
              <HomePageCompanyLogo
                logo={
                  <img src="https://images.ctfassets.net/fo9twyrwpveg/64ONKPtOgn9J90bL8tBBmI/7c9f264f7004d98dc88bb013a36a97e4/wordlogo1.jpeg" />
                }
              />
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <HomePageSearchBar />
          </Grid>
          <Grid item md={6} xs={12}>
            <HomepageStoriesCard />
          </Grid>
          <Grid item md={6} xs={12}>
            <HomePageRequestedReviewsCard />
          </Grid>
          <Grid item md={6} xs={12}>
            <HomePageYourOpenPullRequestsCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <HomePageRSS
              feedURL="http://localhost:7007/api/proxy/aws-news-feed/"
              title="AWS News"
            />
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
            <HomePageMarkdown
              title="History"
              owner="RoadieHQ"
              repo="roadie-backstage-plugins"
              path=".backstage/home-page-test.md"
              branch="test-two-mdown"
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
        </Grid>
      </Content>
    </Page>
  );
};
