/*
 * Copyright 2022 Larder Software Limited
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

import {
  Box,
  Grid,
  Link,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Story } from '../../api/types';
import { useAsync } from 'react-use';
import {
  discoveryApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { Alert, Skeleton } from '@material-ui/lab';
import BugReport from '@material-ui/icons/BugReport';
import Star from '@material-ui/icons/Star';
import Build from '@material-ui/icons/Build';
import { ShortcutClient } from '../../api';
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  listStyle: {
    borderRadius: '1rem',
    boxShadow: theme.shadows[1],
    border: '1px solid #52505017',
    backgroundColor: theme.palette.background.default,
  },
  mainContainer: {
    overflowY: 'scroll',
    height: 'auto',
    maxHeight: '20rem',
    paddingRight: '0.8rem',
    flexWrap: 'nowrap',
  },
  title: {
    fontWeight: Number(theme.typography.fontWeightMedium),
    paddingBottom: '1rem',
  },
  subtitle: {
    color: theme.palette.text.secondary,
  },
  subtitleStarted: {
    color: theme.palette.status.ok,
  },
  subtitleNotStarted: {
    color: '#c9bb82',
  },
  subtitleIcon: {
    display: 'flex',
  },
  linkStyle: {
    textDecoration: 'none',
    color: theme.palette.type === 'light' ? '#FFFFFF' : '#000000',
  },
  bug: {
    backgroundColor: '#eb474717',
    color: '#eb4747',
    borderRadius: '6px',
    marginLeft: '0.5rem',
  },
  feature: {
    backgroundColor: '#99853317',
    color: '#c9bb82',
    borderRadius: '6px',
    marginLeft: '0.5rem',
  },
  chore: {
    backgroundColor: '#3d81f51f',
    color: '#9fadc6',
    borderRadius: '6px',
    marginLeft: '0.5rem',
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    color: theme.palette.text.primary,
    '&:hover': {
      color: '#539bf5',
      fill: '#539bf5',
    },
  },
}));

export const getStoryTypeIcon = (story: string) => {
  switch (story) {
    case 'feature':
      return (
        <Tooltip title="Feature">
          <Star fontSize="small" />
        </Tooltip>
      );
    case 'bug':
      return (
        <Tooltip title="Bug">
          <BugReport fontSize="small" />
        </Tooltip>
      );
    case 'chore':
      return (
        <Tooltip title="Chore">
          <Build fontSize="small" />
        </Tooltip>
      );
    default:
      return null;
  }
};

const StoryItem = ({ story }: { story: Story }) => {
  const classes = useStyles();
  return (
    <Box margin={1} padding={2} className={classes.listStyle}>
      <Grid item xs={12}>
        <Grid item>
          <Typography variant="body1" className={classes.title}>
            <Link
              className={classes.link}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              href={story.app_url}
            >
              {story.name}
            </Link>
          </Typography>
        </Grid>
        <Grid container className={classes.subtitleContainer}>
          <Grid item className={`${classes[story.story_type]}`}>
            <Typography variant="caption" className={classes.subtitleIcon}>
              {getStoryTypeIcon(story.story_type)} #{story.id}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              variant="caption"
              className={
                story.started
                  ? classes.subtitleStarted
                  : classes.subtitleNotStarted
              }
            >
              {story.started ? 'In progress' : 'Not started'}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
const SkeletonStoryItem = () => {
  const classes = useStyles();
  return (
    <Box margin={1} padding={2} className={classes.listStyle}>
      <Grid item xs={12}>
        <Grid item>
          <Typography variant="body1" className={classes.title}>
            <Skeleton variant="text" />
          </Typography>
        </Grid>
        <Grid container className={classes.subtitleContainer}>
          <Grid item>
            <Typography variant="caption" className={classes.subtitleIcon}>
              <Skeleton variant="text" width={100} />
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="caption">
              <Skeleton variant="text" width={100} />
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
const SkeletonStoryView = () => {
  const classes = useStyles();
  return (
    <Grid
      container
      className={classes.mainContainer}
      spacing={1}
      direction="column"
    >
      <SkeletonStoryItem />
      <SkeletonStoryItem />
      <SkeletonStoryItem />
      <SkeletonStoryItem />
    </Grid>
  );
};

const StoriesCardContent = () => {
  const identityApi = useApi(identityApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const api = new ShortcutClient({ discoveryApi });
  const classes = useStyles();

  const { value, loading, error } = useAsync(async () => {
    const profile = await identityApi.getProfileInfo();
    const allMembers = await api.getUsers();
    const loggedUser = allMembers?.find(
      user => user.profile.email_address === profile.email,
    )?.profile.mention_name;

    const stories = await api.fetchOwnedStories({
      owner: loggedUser ? loggedUser : undefined,
    });

    const filteredStories = stories?.filter(
      story => !story.completed && !story.archived,
    );

    return { filteredStories, profile, loggedUser };
  });

  if (loading) {
    return (
      <>
        <Skeleton variant="text" width={250} />
        <SkeletonStoryView />
      </>
    );
  } else if (error) {
    return <Alert severity="error">{error?.message}</Alert>;
  }

  return (
    <>
      {value?.loggedUser ? (
        <>
          <Typography variant="body1">
            Hey {value?.profile.displayName}! &#128515; Here are your stories:{' '}
          </Typography>
          <Grid
            container
            className={classes.mainContainer}
            spacing={1}
            direction="column"
          >
            {value.filteredStories.map((story, index) => (
              <StoryItem story={story} key={index} />
            ))}
          </Grid>
        </>
      ) : (
        <Grid
          container
          className={classes.mainContainer}
          spacing={1}
          direction="column"
        >
          <Typography variant="body1">
            {' '}
            Hey, looks like you don't have any stories associated with the email
            you currently use for sign in. Please double check you are using the
            same email for Backstage and Shortcut profiles :).
          </Typography>
        </Grid>
      )}
    </>
  );
};

export const Content = () => {
  return <StoriesCardContent />;
};
