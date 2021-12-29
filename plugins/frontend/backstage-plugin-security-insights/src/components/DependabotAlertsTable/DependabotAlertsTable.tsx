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

import React, { FC, useState } from 'react';
import { useAsync } from 'react-use';
import { Typography, Box, Paper, ButtonGroup, Button } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import Alert from '@material-ui/lab/Alert';
import { DateTime } from 'luxon';
import { graphql } from '@octokit/graphql';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { Progress, Table, TableColumn, Link } from '@backstage/core-components';
import { useEntity } from "@backstage/plugin-catalog-react";
import { useProjectName } from '../useProjectName';
import { useUrl } from '../useUrl';
import { useProjectEntity } from '../useProjectEntity';

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

type DenseTableProps = {
  repository: Repository;
  detailsUrl: DetailsUrl;
};

const capitalize = (s: string) => {
  return s.charAt(0).toLocaleUpperCase() + s.slice(1);
};

const getDetailsUrl = (packageName: string, detailsUrl: DetailsUrl, dismissedAt: string, vulnerableManifestPath: string ) => {
  const status = dismissedAt ? "closed" : "open";
  const url = `https://${detailsUrl.hostname}/${detailsUrl.owner}/${detailsUrl.repo}/security/dependabot/${vulnerableManifestPath}/${packageName}/${status}`
  return <Link to={url}>{packageName}</Link>
};

export const DenseTable: FC<DenseTableProps> = ({ repository, detailsUrl }) => {
  const { entity } = useEntity();
  const projectName = useProjectName(entity);
  const [filteredTableData, setFilteredTableData] = useState<Node[]>(repository.vulnerabilityAlerts.nodes);
  const [insightsStatusFilter, setInsightsStatusFilter] = useState<any>('all');


  const filterAlerts = (statusFilter: string, issues: Node[]) => {
    setInsightsStatusFilter(statusFilter);
    if (issues && issues.length > 0) {
      setFilteredTableData(issues);
    } else setFilteredTableData([]);
  };

  const dismissedIssues = repository.vulnerabilityAlerts.nodes.filter((entry) => entry.dismissedAt !== null)
  const openIssues = repository.vulnerabilityAlerts.nodes.filter((entry) => entry.dismissedAt === null) || null;

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Created', field: 'createdAt' },
    { title: 'State', field: 'state' },
    { title: 'Severity', field: 'severity' },
    { title: 'Patched Version', field: 'patched_version' },
  ];
  const tableData = filteredTableData.length > 0 ? filteredTableData : []

  const structuredData = tableData.map(node => {
    return {
      createdAt: DateTime.fromISO(node.createdAt).toLocaleString(),
      state: node.dismissedAt ? 'Dismissed' : 'Open',
      name: getDetailsUrl(node.securityVulnerability.package.name, detailsUrl, node.dismissedAt, node.vulnerableManifestPath),
      severity: capitalize((node.securityVulnerability.severity).toLowerCase()),
      patched_version: node?.securityVulnerability?.firstPatchedVersion?.identifier || '',
    };
  });
  return (
    <Table
      title={
        <>
          <Box display="flex" alignItems="center">
            <GitHubIcon />
            <Box mr={1} />
            <Typography variant="h6">{projectName}</Typography>
          </Box>
          <Paper>
            <Box position="absolute" right={350} top={20}>
              <ButtonGroup color="primary" aria-label="text primary button group">
                <Button
                  color={insightsStatusFilter === 'all' ? 'primary' : 'default'}
                  onClick={() => filterAlerts("all", repository.vulnerabilityAlerts.nodes)} >
                  ALL
                </Button>
                <Button
                  color={insightsStatusFilter === 'open' ? 'primary' : 'default'}
                  onClick={() => filterAlerts("open", openIssues)} >
                  OPEN
                </Button>
                <Button
                  color={insightsStatusFilter === 'dismissed' ? 'primary' : 'default'}
                  onClick={() => filterAlerts("dismissed", dismissedIssues)} >
                  DISMISSED
                </Button>
              </ButtonGroup>
            </Box>
          </Paper>
        </>
      }
      options={{ search: true, paging: true, padding: 'dense' }}
      columns={columns}
      data={structuredData}

    />
  );
};

export const DependabotAlertsTable: FC<{}> = () => {
  const { entity } = useEntity();
  const { hostname } = useUrl(entity);
  const { owner, repo } = useProjectEntity(entity);
  const auth = useApi(githubAuthApiRef);

  const query = `
  query GetDependabotAlerts($name: String!, $owner: String!) {
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
   return (value && value.vulnerabilityAlerts) ? <DenseTable repository={value} detailsUrl={detailsUrl} /> : null;
};
