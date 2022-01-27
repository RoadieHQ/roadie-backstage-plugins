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
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import {
  InfoCard,
  Progress,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import ContributorsList from './components/ContributorsList';
import { useRequest } from '../../../hooks/useRequest';
import { useEntityGithubScmIntegration } from '../../../hooks/useEntityGithubScmIntegration';
import { useProjectEntity } from '../../../hooks/useProjectEntity';
import {
  isGithubInsightsAvailable,
  GITHUB_INSIGHTS_ANNOTATION,
} from '../../utils/isGithubInsightsAvailable';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGithubRepository } from '../../../hooks/useGithubRepository';
import { Link } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
  },
}));

type Props = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
};

const ContributorsCard = (_props: Props) => {
  const { entity } = useEntity();
  const classes = useStyles();
  const { hostname } = useEntityGithubScmIntegration(entity);
  const projectAlert = isGithubInsightsAvailable(entity);
  const { owner, repo } = useProjectEntity(entity);
  const { value: isPrivate } = useGithubRepository({ owner, repo });
  const { value, loading, error } = useRequest({
    entity,
    requestName: 'contributors',
    perPage: 10,
    maxResults: 0,
    showTotal: false,
    isPrivate,
  });
  if (!projectAlert) {
    return (
      <MissingAnnotationEmptyState annotation={GITHUB_INSIGHTS_ANNOTATION} />
    );
  }

  if (loading) {
    return <Progress />;
  } else if (error) {
    return error.message.includes('API rate limit') ? (
      <InfoCard title="Contributors" className={classes.infoCard}>
        {' '}
        API Rate Limit exceeded. Authenticated requests get a higher rate limit
        so after you log in and set up GitHub provider, this rate will be
        higher. You can read more in official
        <Link
          href="https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting"
          target="_blank"
          rel="noopener"
          style={{ paddingLeft: '0.3rem' }}
        >
          documentation
        </Link>
      </InfoCard>
    ) : (
      <Alert severity="error" className={classes.infoCard}>
        {error.message}
      </Alert>
    );
  }

  return (
    <InfoCard
      title="Contributors"
      deepLink={{
        link: `//${hostname}/${owner}/${repo}/graphs/contributors`,
        title: 'People',
        onClick: e => {
          e.preventDefault();
          window.open(`//${hostname}/${owner}/${repo}/graphs/contributors`);
        },
      }}
      className={classes.infoCard}
    >
      <ContributorsList contributors={value || []} />
    </InfoCard>
  );
};

export default ContributorsCard;
