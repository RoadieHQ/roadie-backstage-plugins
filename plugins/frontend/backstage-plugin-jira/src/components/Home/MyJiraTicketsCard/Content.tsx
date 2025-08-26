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

import { useState, useCallback } from 'react';
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Button,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableColumn,
  Progress,
  InfoCard,
  Link,
} from '@backstage/core-components';
import { useApi, featureFlagsApiRef } from '@backstage/core-plugin-api';
import { useUserInfo } from '../../../hooks';
import { TicketSummary, UserSummary } from '../../../types';

const useStyles = makeStyles(theme => ({
  statusChip: {
    fontWeight: 'bold',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%',
    justifyContent: 'space-between',
  },
  titleText: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  prChip: {
    margin: theme.spacing(0.5),
    '&.open': { backgroundColor: theme.palette.info.light },
    '&.merged': { backgroundColor: theme.palette.success.light },
    '&.declined': { backgroundColor: theme.palette.error.light },
  },
  prCount: {
    color: theme.palette.primary.main,
    fontWeight: 500,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  prDialogContent: {
    minWidth: '500px',
    maxHeight: '400px',
    padding: 0, // Remove all padding
  },
  truncatedText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    cursor: 'default',
  },
}));

type MyJiraTicketsCardProps = {
  userId: string;
};

// Enhanced ticket type with additional fields needed for the UI
interface EnhancedTicket extends TicketSummary {
  linkedPRs: string;
  lastComment: string;
  assignedDate: string;
}

// Component to display linked pull requests in a dialog
type LinkedPRsDialogProps = {
  open: boolean;
  ticket: TicketSummary;
  onClose: () => void;
};

const LinkedPRsDialog = ({ open, ticket, onClose }: LinkedPRsDialogProps) => {
  const classes = useStyles();
  const pullRequests = ticket.linkedPullRequests || [];
  
  const getStatusClassName = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('open')) return 'open';
    if (statusLower.includes('merged')) return 'merged';
    if (statusLower.includes('declined') || statusLower.includes('rejected')) return 'declined';
    return '';
  };
  
  // Define columns for the Backstage Table component in the dialog
  const columns: TableColumn<any>[] = [
    {
      title: 'Name',
      field: 'name',
      render: (row) => (
        <Link to={row.url} target="_blank">
          {row.name}
        </Link>
      ),
    },
    {
      title: 'Status',
      field: 'status',
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          className={`${classes.prChip} ${getStatusClassName(row.status)}`}
        />
      ),
    },
    {
      title: 'Author',
      field: 'author',
      render: (row) => row.author?.name || 'Unknown',
    },
    {
      title: 'Last Updated',
      field: 'lastUpdate',
      render: (row) => new Date(row.lastUpdate).toLocaleString(),
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">

      <DialogTitle style={{ paddingBottom: 8 }} >
        Linked Pull Requests for {ticket.key} - {ticket.summary}
      </DialogTitle>
      <DialogContent className={classes.prDialogContent} style={{ padding: '8px 24px 0' }}>
        {pullRequests.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Table
            options={{
              paging: false,
              padding: 'dense',
              search: false,
              header: true,
              toolbar: false,
              headerStyle: {
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
              },
              tableLayout: 'fixed',
            }}
            data={pullRequests}
            columns={columns}
          />
          </div>
        ) : (
          <Typography variant="body2">No pull requests linked to this ticket.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};



// Helper function to format ticket data for display
const formatTicketsForDisplay = (tickets: TicketSummary[], user: UserSummary): EnhancedTicket[] => {
  return tickets.map(ticket => {
    // Here we enhance the ticket with additional data for our UI
    return {
      ...ticket,
      // Use actual linked PRs data if available, otherwise show '0'
      linkedPRs: ticket.linkedPullRequests?.length ? ticket.linkedPullRequests.length.toString() : '0',
      // Use real comment data if available, otherwise empty string
      lastComment: ticket.lastComment || '',
      // Use real assigned date if available, otherwise empty string
      assignedDate: ticket.assignedDate || '',
    };
  });
};

// Enhanced JiraTicketsTable component that shows tickets using Backstage's Table component
const JiraTicketsTable = ({ user, tickets }: { user: UserSummary, tickets: EnhancedTicket[] }) => {
  const classes = useStyles();
  const [selectedTicket, setSelectedTicket] = useState<TicketSummary | null>(null);
  const [prDialogOpen, setPrDialogOpen] = useState<boolean>(false);
  
  // Get feature flags API to check if linked PRs should be shown
  const featureFlagsApi = useApi(featureFlagsApiRef);
  const showLinkedPRs = featureFlagsApi.isActive('jira-show-linked-prs');

  // Handle opening the PR dialog
  const handleOpenPrDialog = useCallback((ticket: TicketSummary) => {
    setSelectedTicket(ticket);
    setPrDialogOpen(true);
  }, []);

  // Handle closing the PR dialog
  const handleClosePrDialog = useCallback(() => {
    setPrDialogOpen(false);
  }, []);

  // Function to truncate text to a specific length
  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Define base columns for the Backstage Table component
  const baseColumns: TableColumn<EnhancedTicket>[] = [
    {
      title: 'Issue Key',
      field: 'key',
      width: '120px',
      render: row => (
        <Link
          to={`${user?.url}/browse/${row.key}`}
          target="_blank"
        >
          <Typography
            variant="body2"
            component="span"
            style={{ fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            {row.key}
          </Typography>
        </Link>
      ),
    },
    {
      title: 'Summary',
      field: 'summary',
      // Removed highlight: true to make the column header consistent with others
      render: row => (
        <div className={classes.titleContainer}>
          <div className={classes.titleText}>
            <Tooltip
              title={row.summary || ''}
              enterDelay={0}
              enterNextDelay={0}
              arrow
              placement="top"
            >
              <Link
                to={`${user?.url}/browse/${row.key}`}
                target="_blank"
                style={{ fontWeight: 'normal' }} // Apply normal font weight instead of bold
              >
                {truncateText(row.summary, 50)}
              </Link>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      field: 'status.name',
      width: '120px',
      render: row => (
        <Chip
          label={row.status?.name || 'Open'}
          size="small"
          color="default"
          className={classes.statusChip}
        />
      ),
    },
    // Linked PRs column definition (will be conditionally added)
    {
      title: 'Last Comment',
      field: 'lastComment',
      render: row => {
        const commentText = row.lastComment || 'No comments';
        return commentText !== 'No comments' ? (
          <Tooltip 
            title={commentText}
            enterDelay={0}
            enterNextDelay={0}
            arrow
            placement="top"
          >
            <Typography
              variant="body2"
              component="span"
              className={classes.truncatedText}
            >
              {truncateText(commentText, 50)}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" component="span">
            {commentText}
          </Typography>
        );
      },
    },
    {
      title: 'Assigned Date',
      field: 'assignedDate',
      width: '120px',
      render: row => (
        <Typography variant="body2" color="textSecondary">
          {row.assignedDate}
        </Typography>
      ),
    },
  ];

  // Define a custom title component for the table
  // Using "My Tickets" instead of "My Jira Tickets" to avoid redundancy
  // when used in tabbed layouts (like the home page) where the tab itself
  // already contains "Jira" in the title. This creates a cleaner,
  // more concise user experience while maintaining context.
  const tableTitle = (
    <Typography variant="h5" style={{ display: 'flex', alignItems: 'center' }}>
      My Tickets ({tickets.length})
    </Typography>
  );

  // Conditionally add the Linked PRs column if the feature flag is enabled
  const linkedPRsColumn: TableColumn<EnhancedTicket> = {
    title: 'Linked PR(s)',
    field: 'linkedPRs',
    width: '80px',
    render: row => {
      const prCount = parseInt(row.linkedPRs, 10);
      return prCount > 0 ? (
        <span 
          className={classes.prCount}
          onClick={() => handleOpenPrDialog(row)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleOpenPrDialog(row);
            }
          }}
          aria-label={`View ${prCount} linked pull request${prCount > 1 ? 's' : ''}`}
        >
          {row.linkedPRs}
        </span>
      ) : (
        <span>-</span>
      );
    }
  };
  
  // Create final columns array with or without the Linked PRs column
  const columns = showLinkedPRs 
    ? [...baseColumns.slice(0, 3), linkedPRsColumn, ...baseColumns.slice(3)]
    : baseColumns;

  return (
    <>
      <div data-testid="jira-tickets-table">
        <Table
          options={{
            paging: true,
            padding: 'dense',
            search: true,
            toolbar: true,
            header: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25],
            headerStyle: {
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            },
            searchFieldAlignment: 'right',
            searchFieldStyle: {
              fontFamily: 'Inter, sans-serif', // Match Backstage font style
            },
          }}
          localization={{
            toolbar: {
              searchPlaceholder: 'Search tickets',
            },
          }}
          title={tableTitle}
          data={tickets}
          columns={columns}
        />
      </div>

      {/* Only show the PR dialog if the feature flag is enabled */}
      {showLinkedPRs && selectedTicket && (
        <LinkedPRsDialog 
          ticket={selectedTicket}
          open={prDialogOpen} 
          onClose={handleClosePrDialog}
        />
      )}
    </>
  );
};

export const Content = (props: MyJiraTicketsCardProps) => {
  const { userId } = props;
  const { user, loading, error, tickets } = useUserInfo(userId);

  // Helper component to simplify the repeated InfoCard pattern
  const TicketCard = ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <div style={{ margin: '-20px' }}>
      <InfoCard noPadding title={title}>
        {children}
      </InfoCard>
    </div>
  );

  if (loading) return <Progress />;

  if (error) {
    return (
      <TicketCard title="My Tickets">
        <Typography color="error" style={{ padding: '16px' }}>Error loading jira tickets: {error?.message}</Typography>
      </TicketCard>
    );
  }

  if (!user) {
    return (
      <TicketCard title="My Tickets">
        <Typography style={{ padding: '16px' }}>User not found</Typography>
      </TicketCard>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <TicketCard title="My Tickets">
        <Typography style={{ padding: '16px' }}>No tickets to show</Typography>
      </TicketCard>
    );
  }

  // Process tickets to add the additional fields needed for our UI
  const enhancedTickets = formatTicketsForDisplay(tickets, user);

  return (
    <TicketCard>
      <JiraTicketsTable user={user} tickets={enhancedTickets} />
    </TicketCard>
  );
};
