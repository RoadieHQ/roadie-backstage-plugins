import { Entity } from '@backstage/catalog-model';
import { Dispatch, SetStateAction } from 'react';

export type SecurityInsightFilterState = null | 'open' | 'fixed' | 'dismissed';
export type SeverityLevels = 'all' | 'warning' | 'error' | 'note';

export type SecurityInsight = {
  number: number;
  html_url: string;
  title?: string;
  state: SecurityInsightFilterState;
  rule: {
    severity: SeverityLevels;
    description: string;
  };
  tool: {
    name: string;
  };
  created_at: string;
};

export type SecurityInsightsTabProps = {
  entity: Entity;
};

export type StateFilterComponentProps = {
  insightsStatusFilter: SecurityInsightFilterState;
  value: SecurityInsight[];
  setInsightsStatusFilter: Dispatch<SetStateAction<SecurityInsightFilterState>>;
  setFilteredTableData: Dispatch<SetStateAction<SecurityInsight[]>>;
};

export type UpdateSeverityStatusProps = {
  owner: string;
  repo: string;
  severityData: SecurityInsightFilterState;
  id: number;
  tableData: SecurityInsight[];
  setTableData: Dispatch<SetStateAction<SecurityInsight[]>>;
  entity: Entity;
};

export type IssuesCounterProps = {
  issues: SecurityInsight[];
  issueStatus?: SecurityInsightFilterState;
};

export type GitHubIntegrationConfig = {
  host: string;
  apiBaseUrl: string;
  rawBaseUrl: string;
};
