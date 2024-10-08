import React from 'react';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { ErrorPanel, WarningPanel } from '@backstage/core-components';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { jiraApiRef } from '../../api';
import { LinearProgress } from '@material-ui/core';
import { IssuesTable, IssuesTableProps } from '../IssuesTable';

export type EntityJiraQueryCardProps = {
  jqlQueryFromAnnotation?: string;
  jqlQuery?: string;
  maxResults?: number;
} & Omit<IssuesTableProps, 'issues'>;

export const EntityJiraQueryCard = ({
  jqlQueryFromAnnotation = 'jira/all-issues-jql',
  jqlQuery,
  maxResults,
  ...tableProps
}: EntityJiraQueryCardProps) => {
  const { entity } = useEntity();
  const api = useApi(jiraApiRef);
  const jql = jqlQuery ?? entity.metadata.annotations?.[jqlQueryFromAnnotation];
  const {
    value: issues,
    loading,
    error,
  } = useAsync(async () => {
    if (jql) {
      return await api.jqlQuery(jql, maxResults);
    }
    return undefined;
  }, [jql, api]);
  if (jqlQuery === '') {
    return <WarningPanel message="jqlQuery prop cannot be empty" />;
  } else if (!jql) {
    return <MissingAnnotationEmptyState annotation={jqlQueryFromAnnotation} />;
  }

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }
  return <IssuesTable issues={issues ?? []} {...tableProps} />;
};
