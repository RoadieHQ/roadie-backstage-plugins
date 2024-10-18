/*
 * Copyright 2024 Larder Software Limited
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
import { Box, Theme, Typography, useTheme } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { wizApiRef } from '../../api';
import { useAsync } from 'react-use';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { WIZ_PROJECT_ANNOTATION } from '../constants';
import { useStyles } from '../../style';

const SeverityIndicator = ({
  theme,
  count,
  severity,
  content,
}: {
  theme: Theme;
  count: number;
  severity: string;
  content: any;
}) => {
  const getColorBySeverity = () => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.banner.error;
      case 'medium':
        return theme.palette.warning.main;
      default:
        return theme.palette.success.main;
    }
  };

  return (
    <Box display="flex">
      <Box>
        <Box width={2} height={50} bgcolor={getColorBySeverity()} mr={2} />
      </Box>
      <Box>
        <Typography variant="h6">{count}</Typography>
        <Typography>{content}</Typography>
      </Box>
    </Box>
  );
};

export const IssuesWidget = () => {
  const theme = useTheme();
  const api = useApi(wizApiRef);
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);
  const classes = useStyles();

  const dashboardLink = configApi.getOptionalString('wiz.dashboardLink') ?? '';

  const wizAnnotation =
    entity?.metadata.annotations?.[WIZ_PROJECT_ANNOTATION] ?? '';

  const { value, loading, error } = useAsync(async () => {
    return await api.fetchIssuesForProject(wizAnnotation);
  }, []);

  const openIssues = value?.filter(
    (item: { status: string }) => item.status === 'OPEN',
  );
  const resolvedIssues = value?.filter(
    (item: { status: string }) => item.status === 'RESOLVED',
  );

  const WizIcon = () => {
    return (
      <img
        src={require('../../assets/wiz-logo.png')}
        alt="WIZ Logo"
        className={classes.logo}
      />
    );
  };

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <InfoCard
      title="Issues"
      headerProps={{
        action: <WizIcon />,
        classes: {
          root: classes.card,
        },
      }}
      deepLink={{
        link: `https://${dashboardLink}`,
        title: 'Go to WIZ',
        onClick: e => {
          e.preventDefault();
          window.open(`https://${dashboardLink}`);
        },
      }}
    >
      {' '}
      {value.length > 0 ? (
        <Box display="flex">
          <Box display="flex" flexDirection="column">
            <Typography variant="subtitle1">Open</Typography>

            <Box
              display="flex"
              mt={2}
              flexDirection="column"
              width="12vw"
              style={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              <SeverityIndicator
                theme={theme}
                count={
                  openIssues.filter(
                    (it: { severity: string }) => it.severity === 'CRITICAL',
                  ).length
                }
                severity="high"
                content="Critical severity"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  openIssues.filter(
                    (it: { severity: string }) => it.severity === 'HIGH',
                  ).length
                }
                severity="high"
                content="High severity"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  openIssues.filter(
                    (it: { severity: string }) => it.severity === 'MEDIUM',
                  ).length
                }
                severity="medium"
                content="Medium severity"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  openIssues.filter(
                    (it: { severity: string }) => it.severity === 'LOW',
                  ).length
                }
                severity="low"
                content="Low severity"
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" ml={2}>
            <Typography variant="subtitle1">Resolved</Typography>

            <Box
              display="flex"
              mt={2}
              flexDirection="column"
              width="12vw"
              style={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              <SeverityIndicator
                theme={theme}
                count={
                  resolvedIssues.filter(
                    (it: { severity: string }) => it.severity === 'CRITICAL',
                  ).length
                }
                severity="high"
                content="Critical severity"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  resolvedIssues.filter(
                    (it: { severity: string }) => it.severity === 'HIGH',
                  ).length
                }
                severity="high"
                content="High severity"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  resolvedIssues.filter(
                    (it: { severity: string }) => it.severity === 'MEDIUM',
                  ).length
                }
                severity="medium"
                content="Medium severity"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  resolvedIssues.filter(
                    (it: { severity: string }) => it.severity === 'LOW',
                  ).length
                }
                severity="low"
                content="Low severity"
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography>There are no issues for this project</Typography>
      )}
    </InfoCard>
  );
};
