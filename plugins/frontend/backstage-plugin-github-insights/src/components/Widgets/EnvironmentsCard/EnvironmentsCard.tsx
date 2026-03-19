/*
 * Copyright 2025 Larder Software Limited
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

import { Link, List, ListItem } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  InfoCard,
  Progress,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { useRequest } from '../../../hooks/useRequest';
import { useEntityGithubScmIntegration } from '../../../hooks/useEntityGithubScmIntegration';
import { useProjectEntity } from '../../../hooks/useProjectEntity';
import {
  isGithubInsightsAvailable,
  GITHUB_INSIGHTS_ANNOTATION,
} from '../../utils/isGithubInsightsAvailable';
import { useEntity } from '@backstage/plugin-catalog-react';
import { styles as useStyles } from '../../utils/styles';
import { getHostname } from '../../utils/githubUtils';
import { GitHubAuthorizationWrapper } from '@roadiehq/github-auth-utils-react';

type Environment = {
  id: number;
  html_url: string;
  name: string;
};

const EnvironmentsCardContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();

  const { owner, repo } = useProjectEntity(entity);
  const { value, loading, error } = useRequest(entity, 'environments', 0, 0);
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

  return value?.environments?.length && owner && repo ? (
    <InfoCard
      title="Environments"
      deepLink={{
        link: `https://${hostname}/${owner}/${repo}/deployments`,
        title: 'Environments',
        onClick: e => {
          e.preventDefault();
          window.open(`https://${hostname}/${owner}/${repo}/deployments`);
        },
      }}
      className={classes.infoCard}
    >
      <List>
        {value.environments.map((environment: Environment) => (
          <ListItem className={classes.listItem} key={environment.id}>
            <Link
              href={environment.html_url}
              color="inherit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className={classes.releaseTitle}>{environment.name}</p>
            </Link>
          </ListItem>
        ))}
      </List>
    </InfoCard>
  ) : (
    <></>
  );
};

const EnvironmentsCard = () => {
  const { entity } = useEntity();
  const hostname = getHostname(entity);

  return (
    <GitHubAuthorizationWrapper title="Environments" hostname={hostname}>
      <EnvironmentsCardContent />
    </GitHubAuthorizationWrapper>
  );
};

export default EnvironmentsCard;
