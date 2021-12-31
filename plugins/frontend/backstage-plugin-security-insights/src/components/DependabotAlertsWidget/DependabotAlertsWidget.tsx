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
import Alert from '@material-ui/lab/Alert';
import { makeStyles, Box, Typography, Theme } from '@material-ui/core';
import { graphql } from '@octokit/graphql';
import {
  useApi,
  githubAuthApiRef,
  configApiRef
} from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { useProjectEntity } from '../useProjectEntity';
import { useUrl } from '../useUrl';
import { useEntity } from "@backstage/plugin-catalog-react";
import { InfoCard, Progress } from '@backstage/core-components';

const useStyles = makeStyles((theme: Theme) => ({
  infoCard: {
    marginBottom: theme.spacing(3),
  },
  alertsCount: {
    alignSelf: 'center',
  },
  critical: {
    color: theme.palette.type === 'dark' ? '#f85149' : '#cf222e',
  },
  high: {
    color: theme.palette.type === 'dark' ? '#db6d28' : '#bc4c00',
  },
  medium: {
    color: theme.palette.type === 'dark' ? '#d29922' : '#bf8600',
  },
  low: {
    color: theme.palette.type === 'dark' ? '#c9d1d9' : '#24292f',
  }
}));

type Repository = {
  vulnerabilityAlerts: {
    totalCount: number;
    nodes: Node[];
  };
};

type DetailsUrl = {
  hostname: string;
  owner: string;
  repo: string;
};

type Node = {
  createdAt: string;
  dismissedAt: string;
  vulnerableManifestPath: string;
  securityVulnerability: {
    package: {
      name: string;
    };
    severity: string,
    advisory: {
      description: string,
    },
    firstPatchedVersion: {
      identifier?: string,
    }
  }
};

type DependabotAlertsProps = {
  repository: Repository;
  detailsUrl: DetailsUrl;
};

export const DependabotAlertInformations: FC<DependabotAlertsProps> = ({ repository, detailsUrl }) => {
  const classes = useStyles();
  const configApi = useApi(configApiRef);
  const minimumConfiguredSeverities = configApi?.getOptionalStringArray('dependabotAlertsConfiguration.severity') ?? ['all'];
  // Filter issues so only open issues are taken into cosideration
  const all = repository.vulnerabilityAlerts.nodes.filter((entry) => entry.dismissedAt === null) || null;
  const criticalCount = all.filter(node => node.securityVulnerability.severity === 'CRITICAL').length;
  const highCount = all.filter(node => node.securityVulnerability.severity === 'HIGH').length;
  const mediumCount = all.filter(node => node.securityVulnerability.severity === 'MODERATE').length;
  const lowCount = all.filter(node => node.securityVulnerability.severity === 'LOW').length;

  return (
    <InfoCard
      title="Dependabot Alerts"
      className={classes.infoCard}
      deepLink={{
        link: `https://${detailsUrl.hostname}/${detailsUrl.owner}/${detailsUrl.repo}/security/dependabot`,
        title: 'More info',
        onClick: (e) => {
          e.preventDefault();
          window.open(`//${detailsUrl.hostname}/${detailsUrl.owner}/${detailsUrl.repo}/security/dependabot`);
        },
      }}
    >
      <Box data-testid="severitiesContainer" display="flex">
        {(minimumConfiguredSeverities.length > 0 && minimumConfiguredSeverities.includes('critical') || minimumConfiguredSeverities.includes('all')) &&
          <Box data-testid="severityLevel" ml={2} mr={2} display="flex" className={classes.critical} justifyContent="center" flexDirection="column">
            <Typography className={classes.alertsCount} variant="h1">{criticalCount}</Typography>
            <Typography> Critical severity </Typography>
          </Box>
        }
        {(minimumConfiguredSeverities.length > 0 && minimumConfiguredSeverities.includes('high') || minimumConfiguredSeverities.includes('all')) &&
          <Box data-testid="severityLevel" ml={2} mr={2} display="flex" className={classes.high} justifyContent="center" flexDirection="column">
            <Typography className={classes.alertsCount} variant="h1">{highCount}</Typography>
            <Typography> High severity </Typography>
          </Box>
        }
        {(minimumConfiguredSeverities.length > 0 && minimumConfiguredSeverities.includes('medium') || minimumConfiguredSeverities.includes('all')) &&
          <Box data-testid="severityLevel" ml={2} mr={2} display="flex" className={classes.medium} justifyContent="center" flexDirection="column">
            <Typography className={classes.alertsCount} variant="h1">{mediumCount}</Typography>
            <Typography> Medium severity </Typography>
          </Box>
        }
        {(minimumConfiguredSeverities.length > 0 && minimumConfiguredSeverities.includes('low') || minimumConfiguredSeverities.includes('all')) &&
          <Box data-testid="severityLevel" ml={2} mr={2} display="flex" className={classes.low} justifyContent="center" flexDirection="column">
            <Typography className={classes.alertsCount} variant="h1">{lowCount}</Typography>
            <Typography> Low severity </Typography>
          </Box>
        }
      </Box>
    </InfoCard>
  );
};


export const DependabotAlertsWidget = () => {
  const { entity } = useEntity();
  const { owner, repo } = useProjectEntity(entity);
  const auth = useApi(githubAuthApiRef);
  const { hostname } = useUrl(entity);

  const query = `
  query GetDependabotAlertsWidget($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      vulnerabilityAlerts(first: 100) {
        totalCount
        nodes {
          createdAt
          id
          dismissedAt
          vulnerableManifestPath
          securityVulnerability {
            vulnerableVersionRange
            package {
              name
            }
            firstPatchedVersion {
              identifier
            }
            severity
            advisory {
              description
            }
          }
        }
      }
    }
  }`;

  const { value, loading, error } =
    useAsync(async (): Promise<any> => {
      const token = await auth.getAccessToken(['repo']);
      const gqlEndpoint = graphql.defaults({
        headers: {
          authorization: `token ${token}`,
        },
      });
      const { repository } = await gqlEndpoint(query,{
        name: repo,
        owner: owner
      });
      return repository;
    }, []);

  const detailsUrl = { hostname, owner, repo };
  if (loading) return <Progress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  return (value && value.vulnerabilityAlerts) ? <DependabotAlertInformations repository={value} detailsUrl={detailsUrl} /> : null;
};
