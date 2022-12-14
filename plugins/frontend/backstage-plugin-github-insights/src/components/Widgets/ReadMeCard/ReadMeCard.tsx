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
import { makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  InfoCard,
  Progress,
  MarkdownContent,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import { useRequest } from '../../../hooks/useRequest';
import { useEntityGithubScmIntegration } from '../../../hooks/useEntityGithubScmIntegration';
import { useProjectEntity } from '../../../hooks/useProjectEntity';
import {
  isGithubInsightsAvailable,
  GITHUB_INSIGHTS_ANNOTATION,
} from '../../utils/isGithubInsightsAvailable';
import { useEntity } from '@backstage/plugin-catalog-react';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(2, 1, 2, 2),
    },
  },
  readMe: {
    overflowY: 'auto',
    paddingRight: theme.spacing(1),
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#F5F5F5',
      borderRadius: '5px',
    },
    '&::-webkit-scrollbar': {
      width: '5px',
      backgroundColor: '#F5F5F5',
      borderRadius: '5px',
    },
    '&::-webkit-scrollbar-thumb': {
      border: '1px solid #555555',
      backgroundColor: '#555',
      borderRadius: '4px',
    },
  },
}));

type ReadMeCardProps = {
  entity?: Entity;
  maxHeight?: number;
  title?: string;
  dontStripHtmlCommentsBeforeRendering?: boolean;
  dontReplaceRelativeUrls?: boolean;
};

const getRepositoryDefaultBranch = (url: string) => {
  const repositoryUrl = new URL(url).searchParams.get('ref');
  return repositoryUrl;
};

const ReadMeCard = (props: ReadMeCardProps) => {
  const { dontStripHtmlCommentsBeforeRendering, dontReplaceRelativeUrls } =
    props;
  const { entity } = useEntity();
  const classes = useStyles();
  const { owner, repo, readmePath } = useProjectEntity(entity);
  const request = readmePath ? `contents/${readmePath}` : 'readme';
  const path = readmePath || 'README.md';

  const { value, loading, error } = useRequest(entity, request);
  const { hostname } = useEntityGithubScmIntegration(entity);

  const projectAlert = isGithubInsightsAvailable(entity);
  if (!projectAlert) {
    return (
      <MissingAnnotationEmptyState annotation={GITHUB_INSIGHTS_ANNOTATION} />
    );
  }

  if (loading) {
    return <Progress />;
  } else if (error) {
    return (
      <Alert severity="error" className={classes.infoCard}>
        {error.message}
      </Alert>
    );
  }

  if (!(value?.content && owner && repo)) {
    return <></>;
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
  return (
    <InfoCard
      title={props.title || 'Readme'}
      className={classes.infoCard}
      deepLink={{
        link: `//${hostname}/${owner}/${repo}/blob/${getRepositoryDefaultBranch(
          value.url,
        )}/${path}`,
        title: 'Readme',
        onClick: e => {
          e.preventDefault();
          window.open(
            `//${hostname}/${owner}/${repo}/blob/${getRepositoryDefaultBranch(
              value.url,
            )}/${path}`,
          );
        },
      }}
    >
      <div
        className={classes.readMe}
        style={{
          maxHeight: `${props.maxHeight}px`,
        }}
      >
        <MarkdownContent content={content} />
      </div>
    </InfoCard>
  );
};

export default ReadMeCard;
