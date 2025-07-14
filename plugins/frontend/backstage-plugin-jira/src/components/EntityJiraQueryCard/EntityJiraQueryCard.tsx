import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { WarningPanel } from '@backstage/core-components';
import { IssuesTableProps } from '../IssuesTable';
import { JiraQueryCard } from '../JiraQueryCard';
import { useTemplateParser } from '../../hooks/useTemplateParser';
import { Entity } from '@backstage/catalog-model';
import {
  DEFAULT_JIRA_QUERY_ANNOTATION,
  JIRA_COMPONENT_ANNOTATION,
  JIRA_LABEL_ANNOTATION,
  JIRA_PROJECT_KEY_ANNOTATION,
  JIRA_TEAM_ANNOTATION,
} from '../../constants';
import camelCase from 'lodash/camelCase';

export type EntityJiraQueryCardProps = {
  jqlQueryFromAnnotation?: string;
  jqlQuery?: string;
  maxResults?: number;
  hideOnMissingAnnotation?: boolean;
} & Omit<IssuesTableProps, 'issues'>;

const buildTemplateParserEntityContext = (entity: Entity) => {
  const context: Record<string, string> = {};
  [
    JIRA_COMPONENT_ANNOTATION,
    JIRA_PROJECT_KEY_ANNOTATION,
    JIRA_LABEL_ANNOTATION,
    JIRA_TEAM_ANNOTATION,
  ].forEach(annotation => {
    if (entity.metadata.annotations?.[annotation]) {
      context[camelCase(annotation.split('/')[1])] =
        entity.metadata.annotations?.[annotation];
    }
  });
  return context;
};

export const EntityJiraQueryCard = ({
  jqlQueryFromAnnotation = DEFAULT_JIRA_QUERY_ANNOTATION,
  jqlQuery,
  maxResults,
  hideOnMissingAnnotation = false,
  ...tableProps
}: EntityJiraQueryCardProps) => {
  const { entity } = useEntity();
  const templateParser = useTemplateParser();
  const jql = entity.metadata.annotations?.[jqlQueryFromAnnotation] ?? jqlQuery;

  if (jqlQuery === '') {
    return <WarningPanel message="jqlQuery prop cannot be empty" />;
  } else if (!jql) {
    return hideOnMissingAnnotation ? null : (
      <MissingAnnotationEmptyState annotation={jqlQueryFromAnnotation} />
    );
  }

  return (
    <JiraQueryCard
      jqlQuery={templateParser(jql, buildTemplateParserEntityContext(entity))}
      {...tableProps}
      maxResults={maxResults}
    />
  );
};
