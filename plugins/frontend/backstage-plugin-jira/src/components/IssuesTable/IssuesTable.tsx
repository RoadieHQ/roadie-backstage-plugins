import { Link, Table, TableColumn } from '@backstage/core-components';
import { Box, Tooltip } from '@material-ui/core';
import Person from '@material-ui/icons/Person';
import { Ticket } from '../../types';

export type IssuesTableProps = {
  title?: string;
  subtitle?: string;
  issues: Ticket[];
  columnIds?: (
    | 'key'
    | 'type'
    | 'type-icon'
    | 'status'
    | 'assignee'
    | 'assignee-icon'
    | 'summary'
    | 'priority'
    | 'created'
    | 'updated'
    | 'project'
  )[];
};

const availableColumns: TableColumn<Ticket>[] = [
  {
    title: 'Key',
    field: 'key',
    render: data => (
      <Link
        to={new URL(`/browse/${data?.key}`, data.self).href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {data?.key}
      </Link>
    ),
    width: 'auto',
    id: 'key',
  },
  {
    title: 'summary',
    field: 'fields.summary',
    width: '40%',
    id: 'summary',
  },
  {
    title: 'Priority',
    field: 'fields.priority.name',
    width: 'auto',
    id: 'priority',
  },
  {
    title: 'status',
    field: 'fields.status.name',
    width: 'auto',
    id: 'status',
  },
  {
    title: 'Type',
    field: 'fields.issueType',
    width: 'auto',
    id: 'type-icon',
    render: data => {
      return data.fields?.issuetype ? (
        <Box paddingLeft={1}>
          <img
            src={data.fields?.issuetype?.iconUrl}
            alt={data.fields?.issuetype?.name}
            title={data.fields?.issuetype?.name}
          />
        </Box>
      ) : null;
    },
  },

  {
    title: 'Type',
    field: 'fields.issuetype.name',
    width: 'auto',
    id: 'type',
  },
  {
    title: 'Assignee',
    field: 'fields.assignee',
    width: 'auto',
    id: 'assignee',
    render: data => {
      return data.fields?.assignee?.displayName ? (
        <span>{data.fields?.assignee?.displayName}</span>
      ) : (
        <span>Not Assigned</span>
      );
    },
  },

  {
    title: 'Assignee',
    field: 'fields.assignee',
    width: 'auto',
    id: 'assignee-icon',
    render: data => {
      return (
        <Box paddingLeft={1}>
          {data.fields?.assignee?.displayName ? (
            <img
              src={data.fields?.assignee?.avatarUrls['24x24']}
              alt={data.fields?.assignee?.displayName}
              title={data.fields?.assignee?.displayName}
              width="24px"
            />
          ) : (
            <Tooltip title="Not Assigned">
              <Person color="disabled" />
            </Tooltip>
          )}
        </Box>
      );
    },
  },
  {
    title: 'created',
    field: 'fields.created',
    width: 'auto',
    render: data => {
      return data.fields?.created
        ? new Date(data.fields?.created).toLocaleDateString()
        : '?';
    },
    id: 'created',
  },
  {
    title: 'Updated',
    field: 'fields.updated',
    width: 'auto',
    id: 'updated',
    render: data => {
      return data.fields?.created
        ? new Date(data.fields?.updated).toLocaleDateString()
        : '?';
    },
  },
  {
    title: 'Project',
    field: 'fields.project.name',
    width: 'auto',
    id: 'project',
    render: data => (
      <Link
        to={
          new URL(
            `/browse/${data?.fields?.project?.key}`,
            data?.fields?.project?.self,
          ).href
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        {data?.fields?.project?.name}
      </Link>
    ),
  },
];

export const IssuesTable = ({
  issues,
  title,
  subtitle,
  columnIds = [
    'key',
    'type-icon',
    'summary',
    'status',
    'assignee-icon',
    'priority',
    'created',
    'updated',
  ],
}: IssuesTableProps) => (
  <Table
    title={title ?? 'Issues'}
    subtitle={subtitle ?? ''}
    options={{
      paging: true,
      search: false,
      sorting: true,
      draggable: false,
      padding: 'dense',
    }}
    data={issues ?? []}
    columns={columnIds
      .map(it => availableColumns.find(column => column.id === it))
      .filter(it => !!it)}
  />
);
