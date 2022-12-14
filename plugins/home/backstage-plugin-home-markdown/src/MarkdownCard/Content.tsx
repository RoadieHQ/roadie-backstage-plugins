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
import { Alert } from '@material-ui/lab';
import { Progress, MarkdownContent } from '@backstage/core-components';
import { useGithubFile } from './useGithubFile';
import {
  useApi,
  githubAuthApiRef,
  SessionState,
} from '@backstage/core-plugin-api';
import { MarkdownContentProps } from './types';
import { Button, Grid, Typography, Tooltip } from '@material-ui/core';

const getRepositoryDefaultBranch = (url: string) => {
  const repositoryUrl = new URL(url).searchParams.get('ref');
  return repositoryUrl;
};

const GithubFileContent = (props: MarkdownContentProps) => {
  const {
    owner,
    repo,
    dontStripHtmlCommentsBeforeRendering,
    dontReplaceRelativeUrls,
  } = props;
  const { value, loading, error } = useGithubFile({ ...props });

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!value) {
    return <Progress />;
  }

  let content = Buffer.from(value.content, 'base64').toString('utf8');

  if (!dontStripHtmlCommentsBeforeRendering) {
    content = content.replace(/<!--.*?-->/g, '');
  }

  if (!dontReplaceRelativeUrls) {
    content = content
      .replace(
        /\[([^\[\]]*)\]\((?!https?:\/\/)(.*?)(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)(.*)\)/gim,
        '[$1]' +
          `(//github.com/${owner}/${repo}/raw/${getRepositoryDefaultBranch(
            value.url,
          )}/` +
          '$2$3$4)',
      )
      .replace(
        /\[([^\[\]]*)\]\((?!https?:\/\/)docs\/(.*?)(\.md)\)/gim,
        '[$1](docs/$2/)',
      )
      .replace(
        /\[([^\[\]]*)\]\((?!https?:\/\/)(.*?)(\.md)\)/gim,
        '[$1]' +
          `(//github.com/${owner}/${repo}/blob/${getRepositoryDefaultBranch(
            value.url,
          )}/` +
          '$2$3)',
      );
  }

  return <MarkdownContent content={content} />;
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
export const Content = (props: MarkdownContentProps) => {
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
