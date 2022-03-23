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

import { Grid, Box, Link } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { getStatusIconType } from '../Icons';
import { makeStyles } from '@material-ui/core/styles';
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>((theme: BackstageTheme) => ({
  pullRequestRow: {
    borderBottom: '1px solid grey',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  title: {
    fontWeight: theme.typography.fontWeightBold,
  },
  link: {
    color: theme.palette.text.primary,
    '&:hover': {
      color: '#539bf5',
    },
  },
}));

export const PullRequestsListView = props => {
  const { data } = props;
  const classes = useStyles();
  console.log(data);
  return (
    <Grid container>
      {data.map(pr => (
        <Grid item md={12} className={classes.pullRequestRow}>
          <Typography variant="body1" noWrap className={classes.title}>
            {getStatusIconType(pr)}{' '}
            <Box ml={1} component="span">
              <Link
                className={classes.link}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                href={pr.pull_request.html_url}
              >
                {pr.title}
              </Link>
            </Box>
          </Typography>
          <Typography variant="caption">
            <Box>
              #{pr.number} opened by {pr.user.login}
            </Box>
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};
