import React, { useEffect, useState } from 'react';
import {
  useApi,
  githubAuthApiRef,
  SessionState,
} from '@backstage/core-plugin-api';
import { Grid, Tooltip, Button, Typography } from '@material-ui/core';

export const GithubNotAuthorized = () => {
  const githubApi = useApi(githubAuthApiRef);
  return (
    <Grid container>
      <Grid item xs={8}>
        <Typography>
          You are not logged into github. You need to be signed in to see the
          content of this card.
        </Typography>
      </Grid>
      <Grid item xs={4} container justifyContent="flex-end">
        <Tooltip placement="top" arrow title="Sign in to Github">
          <Button
            variant="outlined"
            color="primary"
            // Calling getAccessToken instead of a plain signIn because we are going to get the correct scopes right away. No need to second request
            onClick={() => githubApi.getAccessToken('repo')}
          >
            Sign in
          </Button>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export const useGithubLoggedIn = () => {
  const githubApi = useApi(githubAuthApiRef);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authSubscription = githubApi.sessionState$().subscribe(state => {
      if (state === SessionState.SignedIn) {
        setIsLoggedIn(true);
      }
    });
    return () => {
      authSubscription.unsubscribe();
    };
  }, [githubApi]);

  return isLoggedIn;
};
