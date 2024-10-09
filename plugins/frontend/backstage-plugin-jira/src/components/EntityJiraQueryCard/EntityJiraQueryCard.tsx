import React from 'react';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { WarningPanel } from '@backstage/core-components';
import { IssuesTableProps } from '../IssuesTable';
import { JiraQueryCard } from '../JiraQueryCard';

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
  const jql = entity.metadata.annotations?.[jqlQueryFromAnnotation] ?? jqlQuery;

  if (jqlQuery === '') {
    return <WarningPanel message="jqlQuery prop cannot be empty" />;
  } else if (!jql) {
    return hideOnMissingAnnotation ? null : (
      <MissingAnnotationEmptyState annotation={jqlQueryFromAnnotation} />
    );
  }

  return (
    <JiraQueryCard jqlQuery={jql} {...tableProps} maxResults={maxResults} />
  );
};
