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

import { Box, Theme, Typography, useTheme } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useStyles } from '../../style';
import wizLogo from '../../assets/wiz-logo.png';
import { useIssues } from '../IssuesContext';

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
  const configApi = useApi(configApiRef);
  const classes = useStyles();
  const { issues: value, loading, error } = useIssues();
  const dashboardLink = configApi.getOptionalString('wiz.dashboardLink') ?? '';

  const issueStatusFilters = {
    openIssues: 'OPEN',
    resolvedIssues: 'RESOLVED',
    inProgress: 'IN_PROGRESS',
    rejectedIssues: 'REJECTED',
  };

  const filteredIssues = Object.fromEntries(
    Object.entries(issueStatusFilters).map(([key, status]) => [
      key,
      value?.filter((item: { status: string }) => item.status === status),
    ]),
  );

  const { openIssues, resolvedIssues, inProgress, rejectedIssues } =
    filteredIssues;

  const WizIcon = () => {
    return <img src={wizLogo} alt="WIZ Logo" className={classes.logo} />;
  };

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <InfoCard
      title="Issues"
      subheader={
        <Typography>
          {' '}
          A summary count of the last 500 issues created, categorized by status.
        </Typography>
      }
      headerProps={{
        action: <WizIcon />,
        classes: {
          root: classes.card,
        },
      }}
      deepLink={
        dashboardLink
          ? {
              link: `https://${dashboardLink}`,
              title: 'Go to your WIZ dashboard',
              onClick: e => {
                e.preventDefault();
                window.open(`https://${dashboardLink}`);
              },
            }
          : undefined
      }
    >
      {' '}
      {value && value.length > 0 ? (
        <Box display="flex">
          <Box display="flex" flexDirection="column">
            <Typography variant="subtitle1">Open</Typography>

            <Box
              display="flex"
              mt={2}
              flexDirection="column"
              width="8.5vw"
              style={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              <SeverityIndicator
                theme={theme}
                count={
                  openIssues?.filter(
                    (it: { severity: string }) => it.severity === 'CRITICAL',
                  ).length || 0
                }
                severity="high"
                content="Critical"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  openIssues?.filter(
                    (it: { severity: string }) => it.severity === 'HIGH',
                  ).length || 0
                }
                severity="high"
                content="High"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  openIssues?.filter(
                    (it: { severity: string }) => it.severity === 'MEDIUM',
                  ).length || 0
                }
                severity="medium"
                content="Medium"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  openIssues?.filter(
                    (it: { severity: string }) => it.severity === 'LOW',
                  ).length || 0
                }
                severity="low"
                content="Low "
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" ml={2}>
            <Typography variant="subtitle1">In Progress</Typography>

            <Box
              display="flex"
              mt={2}
              flexDirection="column"
              width="8.5vw"
              style={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              <SeverityIndicator
                theme={theme}
                count={
                  inProgress?.filter(
                    (it: { severity: string }) => it.severity === 'CRITICAL',
                  ).length || 0
                }
                severity="high"
                content="Critical"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  inProgress?.filter(
                    (it: { severity: string }) => it.severity === 'HIGH',
                  ).length || 0
                }
                severity="high"
                content="High"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  inProgress?.filter(
                    (it: { severity: string }) => it.severity === 'MEDIUM',
                  ).length || 0
                }
                severity="medium"
                content="Medium"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  inProgress?.filter(
                    (it: { severity: string }) => it.severity === 'LOW',
                  ).length || 0
                }
                severity="low"
                content="Low"
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" ml={2}>
            <Typography variant="subtitle1">Resolved</Typography>

            <Box
              display="flex"
              mt={2}
              flexDirection="column"
              width="8.5vw"
              style={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              <SeverityIndicator
                theme={theme}
                count={
                  resolvedIssues?.filter(
                    (it: { severity: string }) => it.severity === 'CRITICAL',
                  ).length || 0
                }
                severity="high"
                content="Critical"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  resolvedIssues?.filter(
                    (it: { severity: string }) => it.severity === 'HIGH',
                  ).length || 0
                }
                severity="high"
                content="High"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  resolvedIssues?.filter(
                    (it: { severity: string }) => it.severity === 'MEDIUM',
                  ).length || 0
                }
                severity="medium"
                content="Medium"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  resolvedIssues?.filter(
                    (it: { severity: string }) => it.severity === 'LOW',
                  ).length || 0
                }
                severity="low"
                content="Low"
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" ml={2}>
            <Typography variant="subtitle1">Rejected</Typography>

            <Box
              display="flex"
              mt={2}
              flexDirection="column"
              width="8.5vw"
              style={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              <SeverityIndicator
                theme={theme}
                count={
                  rejectedIssues?.filter(
                    (it: { severity: string }) => it.severity === 'CRITICAL',
                  ).length || 0
                }
                severity="high"
                content="Critical"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  rejectedIssues?.filter(
                    (it: { severity: string }) => it.severity === 'HIGH',
                  ).length || 0
                }
                severity="high"
                content="High"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  rejectedIssues?.filter(
                    (it: { severity: string }) => it.severity === 'MEDIUM',
                  ).length || 0
                }
                severity="medium"
                content="Medium"
              />
              <SeverityIndicator
                theme={theme}
                count={
                  rejectedIssues?.filter(
                    (it: { severity: string }) => it.severity === 'LOW',
                  ).length || 0
                }
                severity="low"
                content="Low"
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
