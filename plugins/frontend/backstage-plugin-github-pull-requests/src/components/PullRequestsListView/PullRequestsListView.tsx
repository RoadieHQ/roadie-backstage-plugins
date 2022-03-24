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
import { getStatusIconType, CommentIcon } from '../Icons';
import { makeStyles } from '@material-ui/core/styles';
import { useGithubUrl } from '../useGithubUrl';
import { Progress } from '@backstage/core-components';
import { SearchIssuesAndPullRequestsResponseData } from '@octokit/types';

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    border: '1px solid grey',
    borderRadius: '6px',
    minHeight: '10vh',
  },
  pullRequestRow: {
    borderBottom: '1px solid grey',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child': {
      borderBottom: 'none',
    },
    overflowY: 'auto',
    width: '100%',
  },
  title: {
    fontWeight: Number(theme.typography.fontWeightBold),
  },
  link: {
    color: theme.palette.text.primary,
    '&:hover': {
      color: '#539bf5',
    },
    '&:first-child': {
      paddingRight: '4px',
    },
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
}));

type PullRequestListViewProps = {
  data: SearchIssuesAndPullRequestsResponseData['items'];
  emptyStateText: string;
};
export const PullRequestsListView = (props: PullRequestListViewProps) => {
  const { data, emptyStateText } = props;
  console.log(data);
  const classes = useStyles();
  if (data.length < 1) {
    return (
      <Grid
        container
        className={classes.container}
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
      >
        <Grid item md={12}>
          <Typography className={classes.secondaryText} variant="h6">
            {emptyStateText}
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container className={classes.container}>
      {data.map(pr => (
        <PullRequestItem pr={pr} key={pr.id} />
      ))}
    </Grid>
  );
};

type PullRequestItemProps = {
  pr: SearchIssuesAndPullRequestsResponseData['items'][number];
};
const PullRequestItem = (props: PullRequestItemProps) => {
  const { pr } = props;
  const classes = useStyles();
  const { value: repoData, error, loading } = useGithubUrl(pr.repository_url);

  if (loading) return <Progress />;
  if (error) return <>Error...</>;

  return (
    <Grid container spacing={1} width="100%">
      <Grid
        item
        style={{ paddingLeft: '1rem', flexShrink: 0, verticalAlign: 'middle' }}
      >
        {getStatusIconType(pr)}
      </Grid>
      <Grid item xs={10}>
        <Typography variant="body1" noWrap className={classes.title}>
          {repoData ? (
            <Link
              className={classes.secondaryText + ' ' + classes.link}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              href={repoData.html_url}
            >
              {repoData.full_name}
            </Link>
          ) : (
            <></>
          )}
          <Link
            className={classes.link}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            href={pr.pull_request.html_url}
          >
            {pr.title}
          </Link>
        </Typography>
        <Typography variant="caption" className={classes.secondaryText}>
          #{pr.number} opened by{' '}
          <Link
            className={classes.secondaryText + ' ' + classes.link}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            href={pr.user.html_url}
          >
            {pr.user.login}
          </Link>
        </Typography>
      </Grid>

      <Grid
        item
        style={{ verticalAlign: 'middle', display: 'inline-block' }}
        justifyContent="flex-end"
      >
        <CommentIcon />
        {pr.comments}
      </Grid>
    </Grid>
  );
};
