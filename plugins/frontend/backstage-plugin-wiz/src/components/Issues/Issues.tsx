/*
 * Copyright 2024 Larder Software Limited
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

import { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  InputAdornment,
  Link,
  Theme,
  Typography,
  useTheme,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { wizApiRef } from '../../api';
import { useAsync } from 'react-use';
import {
  Content,
  ContentHeader,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { format } from 'date-fns';
import { useEntity } from '@backstage/plugin-catalog-react';
import { WizIssue } from './types';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { createTheme, ThemeProvider, ThemeOptions } from '@mui/material/styles';
import { WIZ_PROJECT_ANNOTATION } from '../constants';
import { useStyles } from '../../style';
import wizLogo from '../../assets/wiz-logo.png';

const getCorrectChip = (theme: Theme, severity: string) => {
  switch (severity) {
    case 'HIGH':
      return (
        <Chip
          label="High"
          size="small"
          style={{
            backgroundColor: theme.palette.banner.error,
            color: theme.palette.banner.text,
          }}
        />
      );
    case 'CRITICAL':
      return (
        <Chip
          label="Critical"
          size="small"
          style={{
            backgroundColor: theme.palette.error.main,
            color: theme.palette.banner.text,
          }}
        />
      );
    case 'MEDIUM':
      return (
        <Chip
          label="Medium"
          size="small"
          style={{
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.banner.text,
          }}
        />
      );
    default:
      return (
        <Chip
          label="Low"
          variant="outlined"
          style={{
            backgroundColor: theme.palette.success.main,
            color: theme.palette.warningText,
          }}
          size="small"
        />
      );
  }
};

const formatDate = (theme: Theme, dateString: string | number | Date) => {
  const date = new Date(dateString);
  return (
    <Typography
      variant="body1"
      style={{ color: theme.palette.text.primary, fontSize: 'small' }}
    >
      {format(date, 'EEE, MMM do / h:mm a')}
    </Typography>
  );
};

export const Issues = () => {
  const theme = useTheme();
  const api = useApi(wizApiRef);
  const { entity } = useEntity();
  const classes = useStyles();
  const wizAnnotation =
    entity?.metadata.annotations?.[WIZ_PROJECT_ANNOTATION] ?? '';
  const { value, loading, error } = useAsync(async () => {
    return await api.fetchIssuesForProject(wizAnnotation);
  }, []);

  const config = useApi(configApiRef);
  const wizBaseUrl = config.getOptionalString('wiz.dashboardLink') ?? '';

  const groupBySourceRuleId = (data: WizIssue[]) => {
    return data?.reduce<Record<string, WizIssue[]>>((acc, issue) => {
      const sourceRuleId = issue.sourceRule.id;
      if (!acc[sourceRuleId]) {
        acc[sourceRuleId] = [];
      }
      acc[sourceRuleId].push(issue);
      return acc;
    }, {});
  };

  const groupedIssues: Record<string, WizIssue[]> =
    groupBySourceRuleId(value) || {};

  const columns = useMemo<MRT_ColumnDef<WizIssue>[]>(() => {
    return [
      {
        id: 'issue',
        header: 'Issue',
        size: 10,
        maxSize: 10,
        accessorFn: row => row.entitySnapshot.name,
        Cell: ({
          row,
        }: {
          row: {
            original: WizIssue;
          };
        }) => {
          const issueId = row.original.id;
          const issueLink = wizBaseUrl.startsWith('http')
            ? `${wizBaseUrl}/issues/${issueId}`
            : `https://${wizBaseUrl}/issues/${issueId}`;

          return (
            <Link href={issueLink} target="_blank" rel="noopener noreferrer">
              {row.original.entitySnapshot.type} |{' '}
              {row.original.entitySnapshot.name}
            </Link>
          );
        },
      },
      {
        id: 'type',
        header: 'Type',
        size: 10,
        maxSize: 10,
        accessorKey: 'type',
        Cell: ({ row }) => (
          <Typography variant="subtitle1">
            <Chip label={row.original.type} variant="outlined" size="small" />
          </Typography>
        ),
      },
      {
        id: 'severity',
        header: 'Severity',
        enableColumnActions: false,
        enableHiding: false,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        size: 10,
        maxSize: 10,
        accessorKey: 'severity',
        Cell: ({ row }) => (
          <Typography variant="subtitle1">
            {getCorrectChip(theme, row.original.severity)}
          </Typography>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        enableColumnActions: false,
        enableHiding: false,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        size: 10,
        maxSize: 10,
        accessorKey: 'status',
        Cell: ({ row }) => (
          <Typography variant="subtitle1">
            <Chip
              label={row.original.status}
              size="small"
              style={{
                backgroundColor:
                  row.original.status === 'RESOLVED'
                    ? theme.palette.success.main
                    : theme.palette.primary.main,
                color: 'white',
              }}
            />
          </Typography>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created At',
        enableColumnActions: false,
        enableHiding: true,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        size: 10,
        maxSize: 10,
        accessorKey: 'createdAt',
        Cell: ({ row }) => (
          <Typography variant="subtitle1">
            {row.original.createdAt
              ? formatDate(theme, row.original.createdAt)
              : ''}
          </Typography>
        ),
      },
      {
        id: 'resolvedAt',
        header: 'Resolved At',
        enableColumnActions: false,
        enableHiding: true,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        size: 10,
        maxSize: 10,
        accessorKey: 'resolvedAt',
        Cell: ({ row }) => (
          <Typography variant="subtitle1">
            {row.original.resolvedAt
              ? formatDate(theme, row.original.resolvedAt)
              : ''}
          </Typography>
        ),
      },
    ];
  }, [theme, wizBaseUrl]);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const WizIcon = () => {
    return (
      <Box pr={1}>
        <img src={wizLogo} alt="WIZ Logo" className={classes.contentLogo} />
      </Box>
    );
  };

  const title = (
    <>
      <Box display="flex">
        <WizIcon />
        <Typography variant="h4">Overview of WIZ issues </Typography>
      </Box>
      <Box pt={1}>
        <Typography variant="subtitle1">
          A breakdown of the last 500 issues created.
        </Typography>
      </Box>
    </>
  );

  return (
    <Page themeId="service">
      <Content>
        <ContentHeader titleComponent={title} />
        {value.length > 0 ? (
          Object.keys(groupedIssues).map(ruleId => (
            <Box pb={2} key={ruleId}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    display="flex"
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box display="flex" flexDirection="column">
                      <Typography
                        variant="body2"
                        style={{
                          color: theme.palette.text.secondary,
                          fontSize: 'smaller',
                        }}
                      >
                        Issue type (Control)
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{
                          color: theme.palette.text.primary,
                        }}
                      >
                        {groupedIssues[ruleId][0]?.sourceRule?.name}
                      </Typography>
                    </Box>
                    <Box display="flex">
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        mr={1}
                      >
                        <Typography
                          variant="body2"
                          style={{
                            color: theme.palette.text.secondary,
                            fontSize: 'smaller',
                          }}
                        >
                          Open
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{
                            color: theme.palette.warningBackground,
                          }}
                        >
                          {
                            groupedIssues[ruleId].filter(
                              issue => issue.status === 'OPEN',
                            ).length
                          }
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        mr={1}
                      >
                        <Typography
                          variant="body2"
                          style={{
                            color: theme.palette.text.secondary,
                            fontSize: 'smaller',
                          }}
                        >
                          Resolved
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{
                            color: theme.palette.status.ok,
                          }}
                        >
                          {
                            groupedIssues[ruleId].filter(
                              issue => issue.status === 'RESOLVED',
                            ).length
                          }
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        mr={1}
                      >
                        <Typography
                          variant="body2"
                          style={{
                            color: theme.palette.text.secondary,
                            fontSize: 'smaller',
                          }}
                        >
                          Total
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{
                            color: theme.palette.primary.main,
                          }}
                        >
                          {groupedIssues[ruleId].length}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Box
                    display="flex"
                    sx={{
                      width: '100%',
                    }}
                    flexDirection="column"
                  >
                    <ThemeProvider theme={createTheme(theme as ThemeOptions)}>
                      <MaterialReactTable
                        data-testid="issues-table"
                        columns={[...columns] as MRT_ColumnDef[]}
                        data={groupedIssues[ruleId]}
                        enableGlobalFilter
                        enableFilterMatchHighlighting
                        muiSearchTextFieldProps={{
                          placeholder: 'Filter',
                          size: 'medium',
                          margin: 'normal',
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <FilterAltOutlinedIcon />
                              </InputAdornment>
                            ),
                          },
                        }}
                        muiTableBodyCellProps={{
                          sx: () => ({
                            whiteSpace: 'nowrap',
                          }),
                        }}
                        defaultColumn={{
                          minSize: 10,
                        }}
                        state={{
                          isLoading: loading,
                        }}
                      />
                    </ThemeProvider>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          ))
        ) : (
          <Typography>There are no issues for this project</Typography>
        )}
      </Content>
    </Page>
  );
};
