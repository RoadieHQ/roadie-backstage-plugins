import { Ticket } from '../../../types';

export type IssuesDataCenterResponse = {
  startAt: number;
  maxResults: number;
  total: number;
  issues: Ticket[];
};
