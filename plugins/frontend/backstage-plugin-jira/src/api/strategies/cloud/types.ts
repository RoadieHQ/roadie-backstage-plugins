import { Ticket } from '../../../types';

export type IssuesCloudResponse = {
  nextPageToken: string;
  maxResults: number;
  total: number;
  issues: Ticket[];
};
