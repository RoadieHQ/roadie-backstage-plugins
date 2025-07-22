import React, { useState } from 'react';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { LAUNCHDARKLY_PROJECT_KEY_ANNOTATION } from '../../constants';
import {
  ErrorBoundary,
  ErrorPanel,
  Link,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import {
  MultiEnvironmentFlag,
  useLaunchdarklyMultiEnvironmentFlags,
} from '../../hooks/useLaunchdarklyMultiEnvironmentFlags';
import { FlagDetailsPanel } from '../EntityLaunchdarklyContextOverviewCard/FlagDetailsPanel';
import { ValueRenderer } from '../EntityLaunchdarklyContextOverviewCard/FlagVariationValueRenderer';

const useStyles = makeStyles(theme => ({
  settingsButton: {
    marginLeft: theme.spacing(1),
  },
  statusEnabled: {
    color: theme.palette.success.main,
    fontWeight: 'bold',
  },
  statusDisabled: {
    color: theme.palette.error.main,
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
  },
  tagChip: {
    height: '22px',
    fontSize: '0.75rem',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  },
  noTags: {
    color: theme.palette.text.disabled,
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },
}));

export type EntityLaunchdarklyCardProps = {
  title?: string;
  enableSearch?: boolean;
  envs?: string[];
};

export const EntityLaunchdarklyCard = (props: EntityLaunchdarklyCardProps) => {
  const { title, enableSearch = false, envs = ['production'] } = props;
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const classes = useStyles();

  // State for column visibility settings
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      name: true,
      key: true,
      description: true,
      tags: true,
      variations: false,
    },
  );

  // Fetch flags data
  const {
    value: flags,
    error,
    loading,
  } = useLaunchdarklyMultiEnvironmentFlags(entity, envs);

  // Handle settings menu
  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  // Handle column visibility toggle
  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Check if the required annotation is present
  if (!entity.metadata?.annotations?.[LAUNCHDARKLY_PROJECT_KEY_ANNOTATION]) {
    return (
      <MissingAnnotationEmptyState
        annotation={LAUNCHDARKLY_PROJECT_KEY_ANNOTATION}
        readMoreUrl="https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/plugins/frontend/backstage-plugin-launchdarkly/README.md"
      />
    );
  }

  // Create dynamic columns based on visible environments
  const createDynamicColumns = (): TableColumn<MultiEnvironmentFlag>[] => {
    const baseColumns: TableColumn<MultiEnvironmentFlag>[] = [];

    // Add base columns based on visibility settings
    if (visibleColumns.name) {
      baseColumns.push({
        title: 'Name',
        field: 'name',
        render: row => (
          <Link
            to={Object.values(row.environments)[0]?.link || '#'}
            target="_blank"
          >
            {row.name}
          </Link>
        ),
      });
    }

    if (visibleColumns.key) {
      baseColumns.push({
        title: 'Key',
        field: 'key',
      });
    }

    if (visibleColumns.description) {
      baseColumns.push({
        title: 'Description',
        field: 'description',
        render: row => (
          <span style={{ fontSize: '0.875rem' }}>
            {row.description || 'No description'}
          </span>
        ),
      });
    }

    // Add environment columns based on visibility settings
    const environmentColumns: TableColumn<MultiEnvironmentFlag>[] = [];
    if (flags && flags.length > 0) {
      envs.forEach(envKey => {
        environmentColumns.push({
          title: envKey,
          render: row => {
            const envData = row.environments[envKey];
            if (!envData) return 'N/A';

            return (
              <span
                className={
                  envData.on ? classes.statusEnabled : classes.statusDisabled
                }
              >
                {envData.status}
              </span>
            );
          },
        });
      });
    }

    // Add optional columns based on visibility settings
    if (visibleColumns.tags) {
      baseColumns.push({
        title: 'Labels',
        field: 'tags',
        render: row => {
          if (!row.tags || row.tags.length === 0) {
            return <span className={classes.noTags}>No labels</span>;
          }
          return (
            <div className={classes.tagContainer}>
              {row.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  className={classes.tagChip}
                  color="primary"
                />
              ))}
            </div>
          );
        },
      });
    }

    if (visibleColumns.variations) {
      baseColumns.push({
        title: 'Variations',
        render: row =>
          row.variations ? <ValueRenderer value={row.variations} /> : 'N/A',
      });
    }

    return [...baseColumns, ...environmentColumns];
  };

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">{title || 'LaunchDarkly Flags'}</Typography>
        <Tooltip title="Column Settings">
          <IconButton
            className={classes.settingsButton}
            onClick={handleSettingsClick}
            size="small"
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleSettingsClose}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">Columns</Typography>
          </MenuItem>
          <MenuItem>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns.name}
                    onChange={() => handleColumnToggle('name')}
                    size="small"
                  />
                }
                label="Name"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns.key}
                    onChange={() => handleColumnToggle('key')}
                    size="small"
                  />
                }
                label="Key"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns.description}
                    onChange={() => handleColumnToggle('description')}
                    size="small"
                  />
                }
                label="Description"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns.tags}
                    onChange={() => handleColumnToggle('tags')}
                    size="small"
                  />
                }
                label="Labels"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns.variations}
                    onChange={() => handleColumnToggle('variations')}
                    size="small"
                  />
                }
                label="Variations"
              />
            </FormGroup>
          </MenuItem>
        </Menu>
      </Box>

      <Table
        columns={createDynamicColumns()}
        data={flags || []}
        detailPanel={({ rowData }) => (
          <ErrorBoundary>
            <FlagDetailsPanel
              flag={{
                name: rowData.name,
                key: rowData.key,
                status: '',
                environmentKey: '',
                link: '',
                variations: rowData.variations,
                description: rowData.description,
                tags: rowData.tags,
                maintainer: rowData.maintainer,
              }}
              discoveryApi={discoveryApi}
              entity={entity}
            />
          </ErrorBoundary>
        )}
        options={{
          paging: true,
          search: enableSearch,
          draggable: false,
          padding: 'dense',
        }}
      />
    </>
  );
};
