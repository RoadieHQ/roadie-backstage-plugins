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

import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from '@material-ui/lab';
import {
  Progress,
  MarkdownContent as RawMarkdownContent,
} from '@backstage/core-components';
import {
  useApi,
  githubAuthApiRef,
  SessionState,
  useApiHolder,
  ApiHolder,
  errorApiRef,
  ErrorApi,
} from '@backstage/core-plugin-api';
import { MarkdownContentProps } from './types';
import { Button, Grid, Typography, Tooltip } from '@material-ui/core';
import useAsync from 'react-use/lib/useAsync';
import { githubApiRef, GithubClient, GithubApi } from '../../../apis';

const getGithubClient = (apiHolder: ApiHolder, errorApi: ErrorApi) => {
  let githubClient: GithubApi | undefined = apiHolder.get(githubApiRef);
  if (!githubClient) {
    const auth = apiHolder.get(githubAuthApiRef);
    if (auth) {
      githubClient = new GithubClient({ githubAuthApi: auth, errorApi });
    }
  }
  if (!githubClient) {
    throw new Error(
      'The MarkdownCard component Failed to get the github client',
    );
  }
  return githubClient;
};

const GithubFileContent = (props: MarkdownContentProps) => {
  const { preserveHtmlComments } = props;
  const apiHolder = useApiHolder();
  const errorApi = useApi(errorApiRef);

  const { value, loading, error } = useAsync(async () => {
    const githubClient = getGithubClient(apiHolder, errorApi);
    return githubClient.getContent({ ...props });
  }, [apiHolder]);

  const transformImageUri = useCallback(
    (href: string) => {
      return value?.media[href] || href;
    },
    [value?.media],
  );

  const transformLinkUri = useCallback(
    (href: string) => {
      return value?.links[href] || href;
    },
    [value?.links],
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!value) {
    return <Progress />;
  }

  let content = value.content;
  if (!preserveHtmlComments) {
    content = content.replace(/<!--(.|\n)*?-->/g, '');
  }

  return (
    <RawMarkdownContent
      transformImageUri={transformImageUri}
      transformLinkUri={transformLinkUri}
      content={content}
    />
  );
};

const GithubNotAuthorized = () => {
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

/**
 * A component to render a markdown file from github
 *
 * @public
 */
const MarkdownContent = (props: MarkdownContentProps) => {
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

  return isLoggedIn ? (
    <GithubFileContent {...props} />
  ) : (
    <GithubNotAuthorized />
  );
};

export default MarkdownContent;
