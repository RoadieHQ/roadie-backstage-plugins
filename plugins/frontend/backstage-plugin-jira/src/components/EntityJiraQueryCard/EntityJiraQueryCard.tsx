import React from 'react';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { ErrorPanel, WarningPanel } from '@backstage/core-components';
import { useAsync } from 'react-use';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { jiraApiRef } from '../../api';
import { LinearProgress } from '@material-ui/core';
import { IssuesTable, IssuesTableProps } from '../IssuesTable';
import { useTemplateParser } from '../../hooks/useTemplateParser';

export type EntityJiraQueryCardProps = {
  jqlQueryFromAnnotation?: string;
  jqlQuery?: string;
  maxResults?: number;
  hideOnMissingAnnotation?: boolean;
} & Omit<IssuesTableProps, 'issues'>;

export const EntityJiraQueryCard = ({
  jqlQueryFromAnnotation = 'jira/all-issues-jql',
  jqlQuery,
  maxResults,
  hideOnMissingAnnotation = false,
  ...tableProps
}: EntityJiraQueryCardProps) => {
  const { entity } = useEntity();
  const api = useApi(jiraApiRef);
  const identityApi = useApi(identityApiRef);
  const templateParser = useTemplateParser();
  const jql = jqlQuery ?? entity.metadata.annotations?.[jqlQueryFromAnnotation];
  const {
    value: issues,
    loading,
    error,
  } = useAsync(async () => {
    if (jql) {
      const profile = await identityApi.getProfileInfo();
      return await api.jqlQuery(
        templateParser(jql, {
          userEmail: profile.email ?? '',
          userDisplayName: profile.displayName ?? '',
        }),
        maxResults,
      );
    }
    return undefined;
  }, [jql, api]);
  if (jqlQuery === '') {
    return <WarningPanel message="jqlQuery prop cannot be empty" />;
  } else if (!jql) {
    return hideOnMissingAnnotation ? null : (
      <MissingAnnotationEmptyState annotation={jqlQueryFromAnnotation} />
    );
  }

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }
  return <IssuesTable issues={issues ?? []} {...tableProps} />;
};
