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
