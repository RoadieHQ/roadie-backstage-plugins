import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { jiraApiRef } from '../../api';
import { useTemplateParser } from '../../hooks/useTemplateParser';
import { useAsync } from 'react-use';
import { ErrorPanel, WarningPanel } from '@backstage/core-components';
import { LinearProgress } from '@material-ui/core';
import { IssuesTable, IssuesTableProps } from '../IssuesTable';

export type JiraQueryCardProps = {
  jqlQuery: string;
  maxResults?: number;
  hideOnMissingAnnotation?: boolean;
} & Omit<IssuesTableProps, 'issues'>;

export const JiraQueryCard = ({
  jqlQuery,
  maxResults,
  hideOnMissingAnnotation = false,
  ...tableProps
}: JiraQueryCardProps) => {
  const api = useApi(jiraApiRef);
  const identityApi = useApi(identityApiRef);
  const templateParser = useTemplateParser();
  const {
    value: issues,
    loading,
    error,
  } = useAsync(async () => {
    if (jqlQuery) {
      const profile = await identityApi.getProfileInfo();
      return await api.jqlQuery(
        templateParser(jqlQuery, {
          userEmail: profile.email ?? '',
          userDisplayName: profile.displayName ?? '',
        }),
        maxResults,
      );
    }
    return undefined;
  }, [jqlQuery, api]);
  if (jqlQuery === '') {
    return <WarningPanel message="jqlQuery prop cannot be empty" />;
  }

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }
  return <IssuesTable issues={issues ?? []} {...tableProps} />;
};
