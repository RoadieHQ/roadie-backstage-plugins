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

import { Chip, Link, List, ListItem } from '@material-ui/core';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';
import Alert from '@material-ui/lab/Alert';
import {
  InfoCard,
  MissingAnnotationEmptyState,
  Progress,
} from '@backstage/core-components';
import { useRequest } from '../../../hooks/useRequest';
import { useEntityGithubScmIntegration } from '../../../hooks/useEntityGithubScmIntegration';
import { useProjectEntity } from '../../../hooks/useProjectEntity';
import {
  GITHUB_INSIGHTS_ANNOTATION,
  isGithubInsightsAvailable,
} from '../../utils/isGithubInsightsAvailable';
import { useEntity } from '@backstage/plugin-catalog-react';
import { styles as useStyles } from '../../utils/styles';
import { getHostname } from '../../utils/githubUtils';
import { GitHubAuthorizationWrapper } from '@roadiehq/github-auth-utils-react';

type Release = {
  id: number;
  html_url: string;
  tag_name: string;
  prerelease: boolean;
  name: string;
};

const ReleasesCardContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();

  const { owner, repo } = useProjectEntity(entity);
  const { value, loading, error } = useRequest(entity, 'releases', 0, 5);
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

  return value?.length && owner && repo ? (
    <InfoCard
      title="Releases"
      deepLink={{
        link: `https://${hostname}/${owner}/${repo}/releases`,
        title: 'Releases',
        onClick: e => {
          e.preventDefault();
          window.open(`https://${hostname}/${owner}/${repo}/releases`);
        },
      }}
      className={classes.infoCard}
    >
      <List>
        {value.map((release: Release) => (
          <ListItem className={classes.listItem} key={release.id}>
            <Link
              href={release.html_url}
              color="inherit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className={classes.releaseTitle}>{release.name}</p>
              <LocalOfferOutlinedIcon
                fontSize="inherit"
                className={classes.releaseTagIcon}
              />{' '}
              {release.tag_name}
              {/* by {release.author.login} */}
            </Link>
            {release.prerelease && (
              <Chip color="primary" size="small" label="Pre-release" />
            )}
          </ListItem>
        ))}
      </List>
    </InfoCard>
  ) : (
    <></>
  );
};

const ReleasesCard = () => {
  const { entity } = useEntity();
  const hostname = getHostname(entity);

  return (
    <GitHubAuthorizationWrapper title="Releases" hostname={hostname}>
      <ReleasesCardContent />
    </GitHubAuthorizationWrapper>
  );
};

export default ReleasesCard;
