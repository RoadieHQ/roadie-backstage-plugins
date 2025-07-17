import { Ticket } from '../../../types';

export type SearchDataCenterResponse = {
  startAt: number;
  maxResults: number;
  total: number;
  issues: Ticket[];
};
