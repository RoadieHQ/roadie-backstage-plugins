import { Ticket } from '../../../types';

export type SearchCloudResponse = {
  nextPageToken: string;
  maxResults: number;
  total: number;
  issues: Ticket[];
};
