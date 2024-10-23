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
import ContributorsList from './components/ContributorsList';
import { useRequest } from '../../../hooks/useRequest';
import { useEntityGithubScmIntegration } from '../../../hooks/useEntityGithubScmIntegration';
import { useProjectEntity } from '../../../hooks/useProjectEntity';
import {
  isGithubInsightsAvailable,
  GITHUB_INSIGHTS_ANNOTATION,
} from '../../utils/isGithubInsightsAvailable';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  GithubNotAuthorized,
  useGithubLoggedIn,
} from '../../../hooks/useGithubLoggedIn';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
  },
}));

const ContributorsCardContent = () => {
  const { entity } = useEntity();
  const classes = useStyles();
  const { value, loading, error } = useRequest(entity, 'contributors', 10);
  const { hostname } = useEntityGithubScmIntegration(entity);
  const projectAlert = isGithubInsightsAvailable(entity);
  const { owner, repo } = useProjectEntity(entity);
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

  return (
    <InfoCard
      title="Contributors"
      deepLink={{
        link: `https://${hostname}/${owner}/${repo}/graphs/contributors`,
        title: 'People',
        onClick: e => {
          e.preventDefault();
          window.open(
            `https://${hostname}/${owner}/${repo}/graphs/contributors`,
          );
        },
      }}
      className={classes.infoCard}
    >
      <ContributorsList contributors={value || []} />
    </InfoCard>
  );
};

const ContributorsCard = () => {
  const classes = useStyles();
  const isLoggedIn = useGithubLoggedIn();

  return isLoggedIn ? (
    <ContributorsCardContent />
  ) : (
    <InfoCard title="Contributors" className={classes.infoCard}>
      <GithubNotAuthorized />
    </InfoCard>
  );
};

export default ContributorsCard;
