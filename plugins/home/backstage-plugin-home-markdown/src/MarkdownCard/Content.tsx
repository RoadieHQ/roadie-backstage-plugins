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

import React, { useEffect, useState } from 'react';
import Alert from '@material-ui/lab/Alert';
import { Progress, MarkdownContent } from '@backstage/core-components';
import { useGithubFile } from './useGithubFile';
import {
  useApi,
  githubAuthApiRef,
  SessionState,
} from '@backstage/core-plugin-api';

import { Button, Grid, Typography, Tooltip } from '@material-ui/core';

/**
 * Props for Markdown content component {@link Content}.
 *
 * @public
 */
export type MarkdownContentProps = {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
};

/**
 * A component to render a markdown file from github
 *
 * @public
 */
export const Content = (props: MarkdownContentProps) => {
  const auth = useApi(githubAuthApiRef);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authSubscription = auth.sessionState$().subscribe(state => {
      if (state === SessionState.SignedIn) {
        setIsLoggedIn(true);
      }
    });
    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  return isLoggedIn ? (
    <GithubFileContent {...props} />
  ) : (
    <GithubNotAuthorized api={auth} />
  );
};

const GithubFileContent = (props: MarkdownContentProps) => {
  const { value, loading, error } = useGithubFile(props);
  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <MarkdownContent
      content={Buffer.from(value.content, 'base64').toString('utf8')}
    />
  );
};

const GithubNotAuthorized = ({ api }: { api: any }) => {
  return (
    <Grid container>
      <Grid item xs={8}>
        <Typography>
          You are not logged into github. You need to be sign in to see the
          content of this card.
        </Typography>
      </Grid>
      <Grid item xs={4} container justifyContent="flex-end">
        <Tooltip placement="top" arrow title={`Sign in to Github`}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => api.getAccessToken('repo')}
          >
            {`Sign in`}
          </Button>
        </Tooltip>
      </Grid>
    </Grid>
  );
};
