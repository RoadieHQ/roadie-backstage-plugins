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

import { Box, List, ListItem } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  InfoCard,
  Progress,
  StructuredMetadataTable,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import {
  useProtectedBranches,
  useRepoLicence,
  NO_LICENSE_MSG,
} from '../../../hooks/useComplianceHooks';
import { useProjectEntity } from '../../../hooks/useProjectEntity';
import {
  isGithubInsightsAvailable,
  GITHUB_INSIGHTS_ANNOTATION,
} from '../../utils/isGithubInsightsAvailable';
import WarningIcon from '@material-ui/icons/ErrorOutline';
import { styles as useStyles } from '../../utils/styles';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getHostname } from '../../utils/githubUtils';
import { GitHubAuthorizationWrapper } from '@roadiehq/github-auth-utils-react';

const ComplianceCardContent = () => {
  const { entity } = useEntity();
  const { branches, loading, error } = useProtectedBranches(entity);
  const {
    license,
    loading: licenseLoading,
    error: licenseError,
  } = useRepoLicence(entity);
  const classes = useStyles();
  const { owner, repo } = useProjectEntity(entity);
  const projectAlert = isGithubInsightsAvailable(entity);
  if (!projectAlert) {
    return (
      <MissingAnnotationEmptyState annotation={GITHUB_INSIGHTS_ANNOTATION} />
    );
  }

  if (loading || licenseLoading) {
    return <Progress />;
  } else if (error || licenseError) {
    return (
      <Alert severity="error">
        Error occurred while fetching data for the compliance card:{' '}
        {error?.message}
      </Alert>
    );
  }

  return (
    <InfoCard title="Compliance report" className={classes.infoCard}>
      <StructuredMetadataTable
        metadata={{
          'Protected branches':
            branches?.length && owner && repo ? (
              <List className={classes.listStyle}>
                {branches.map((branch: any) => (
                  <ListItem key={branch.name}>{branch.name}</ListItem>
                ))}
              </List>
            ) : (
              <Box display="flex" alignItems="center">
                <WarningIcon
                  style={{
                    color: 'orange',
                    marginRight: '5px',
                    flexShrink: 0,
                  }}
                />
                <span>None</span>
              </Box>
            ),
          License:
            license === NO_LICENSE_MSG ? (
              <Box display="flex" alignItems="center">
                <WarningIcon
                  style={{
                    color: 'orange',
                    marginRight: '5px',
                    flexShrink: 0,
                  }}
                />
                <span>None</span>
              </Box>
            ) : (
              license
            ),
        }}
      />
    </InfoCard>
  );
};

const ComplianceCard = () => {
  const { entity } = useEntity();
  const hostname = getHostname(entity);

  return (
    <GitHubAuthorizationWrapper title="Compliance" hostname={hostname}>
      <ComplianceCardContent />
    </GitHubAuthorizationWrapper>
  );
};

export default ComplianceCard;
