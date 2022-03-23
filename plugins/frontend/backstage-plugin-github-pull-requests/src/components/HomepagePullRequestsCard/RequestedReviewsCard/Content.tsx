import React from 'react';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { Octokit } from '@octokit/rest';
import { useAsync } from 'react-use';
import { Grid, Box, Link } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { getStatusIconType } from '../../Icons';
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

const usePullRequest = (queryFn: CallableFunction) => {
  const auth = useApi(githubAuthApiRef);

  return useAsync(async () => {
    const token = await auth.getAccessToken(['repo']);
    const identity = await auth.getBackstageIdentity();

    const pullRequestResponse = await new Octokit({
      auth: token,
      baseUrl: 'https://api.github.com',
    }).search.issuesAndPullRequests({
      q: queryFn(identity),
      per_page: 5,
      page: 1,
    });
    return pullRequestResponse.data;
  }, [auth]);
};

const PullRequestsListView = props => {
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

export const Content = () => {
  const { loading, error, value } = usePullRequest(
    identity =>
      `is:closed is:pr review-requested:${identity.id} archived:false`,
  );

  if (loading) return <>Loading...</>;
  if (error) return <>Error...</>;

  if (value) {
    return (
      <PullRequestsListView
        data={value.items}
        loading={loading}
        pageSize={5}
        page={1}
        projectName="Requested reviews from you"
      />
    );
  }
  return <div>PRs</div>;
};
