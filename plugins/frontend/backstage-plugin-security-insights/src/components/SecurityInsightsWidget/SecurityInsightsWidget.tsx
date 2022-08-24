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

import React, { FC } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  InfoCard,
  Progress,
  StructuredMetadataTable,
} from '@backstage/core-components';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { Octokit } from '@octokit/rest';
import { useProjectEntity } from '../useProjectEntity';
import { useUrl } from '../useUrl';
import { getSeverityBadge } from '../utils';
import {
  SecurityInsight,
  IssuesCounterProps,
  SeverityLevels,
  SecurityInsightFilterState,
} from '../../types';
import { useEntity } from '@backstage/plugin-catalog-react';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
  },
}));

const IssuesCounter: FC<IssuesCounterProps> = ({
  issues,
  issueStatus = null,
}) => {
  const countIssues = (
    type: SecurityInsightFilterState,
    severityLevel: SeverityLevels,
  ) =>
    issues.reduce(
      (acc, cur) =>
        (cur.state === type || issueStatus === null) &&
        cur.rule.severity === severityLevel
          ? ++acc
          : acc,
      0,
    );

  const countWarningIssues = countIssues(issueStatus, 'warning');
  const countErrorIssues = countIssues(issueStatus, 'error');
  const countNoteIssues = countIssues(issueStatus, 'note');
  return (
    <Box display="flex" flexDirection="column">
      {getSeverityBadge('warning', countWarningIssues)}
      {getSeverityBadge('error', countErrorIssues)}
      {getSeverityBadge('note', countNoteIssues)}
    </Box>
  );
};

export const SecurityInsightsWidget = () => {
  const { entity } = useEntity();
  const { owner, repo } = useProjectEntity(entity);
  const classes = useStyles();
  const auth = useApi(githubAuthApiRef);
  const { baseUrl, hostname } = useUrl(entity);

  const { value, loading, error } = useAsync(async (): Promise<
    SecurityInsight[]
  > => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({ auth: token });

    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/code-scanning/alerts',
      {
        baseUrl,
        owner,
        repo,
      },
    );

    const data = response.data as SecurityInsight[];
    return data;
  }, []);

  return (
    <InfoCard
      title="Security Insights"
      className={classes.infoCard}
      deepLink={{
        link: `//${hostname}/${owner}/${repo}/security/code-scanning`,
        title: 'Security Insights',
        onClick: e => {
          e.preventDefault();
          window.open(`//${hostname}/${owner}/${repo}/security/code-scanning`);
        },
      }}
    >
      <Box position="relative">
        {error ? (
          <Alert severity="error" className={classes.infoCard}>
            {error.message}
          </Alert>
        ) : null}

        {loading ? (
          <Box my={3}>
            <Progress />
          </Box>
        ) : (
          <>
            {value ? (
              <StructuredMetadataTable
                metadata={{
                  'Open Issues': (
                    <IssuesCounter issues={value} issueStatus="open" />
                  ),
                }}
              />
            ) : null}
          </>
        )}
      </Box>
    </InfoCard>
  );
};
