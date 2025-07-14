/*
 * Copyright 2022 Larder Software Limited
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

import {
  SetStateAction,
  Dispatch,
  ChangeEvent,
  MouseEvent,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { CloudsmithPackageListContentProps } from './types';
import { CloudsmithClient, Package } from '../../api';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useAsyncFn } from 'react-use';
import { ErrorPanel, Table, InfoCard } from '@backstage/core-components';
import {
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
  CircularProgress,
} from '@material-ui/core';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import SecurityIcon from '@material-ui/icons/Security';
import SyncIcon from '@material-ui/icons/Sync';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import LabelIcon from '@material-ui/icons/Label';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import LaunchIcon from '@material-ui/icons/Launch';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  chip: {
    margin: theme.spacing(0.5),
  },
  infoButton: {
    padding: 0,
    marginLeft: theme.spacing(1),
  },
  dialogContent: {
    padding: theme.spacing(2),
  },
  metadataItem: {
    marginBottom: theme.spacing(1),
  },
  securityStatus: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  securityIcon: {
    marginRight: theme.spacing(1),
  },
  filesList: {
    maxHeight: 200,
    overflow: 'auto',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: theme.spacing(2),
  },
  searchField: {
    marginRight: theme.spacing(1),
    flexGrow: 1,
  },
  searchTypeSelect: {
    minWidth: 150,
    marginRight: theme.spacing(1),
  },
  tagChip: {
    margin: theme.spacing(0.5),
    cursor: 'pointer',
  },
}));

const searchOptions = [
  { value: 'name', label: 'Name' },
  { value: 'version', label: 'Version' },
  { value: 'format', label: 'Format' },
  { value: 'tag', label: 'Tag' },
  { value: 'custom', label: 'Cloudsmith Custom Query' },
];

const parseTags = (tags: Record<string, string[]>) => {
  return Object.entries(tags).flatMap(([key, values]) =>
    values.map(value => `${key}:${value}`),
  );
};

const getPlaceholder = (searchType: string) => {
  switch (searchType) {
    case 'custom':
      return 'Enter Cloudsmith custom query';
    case 'tag':
      return 'Enter tag';
    default:
      return `Enter ${searchType}`;
  }
};

const renderSearchInput = (
  searchType: string,
  query: string,
  setQuery: Dispatch<SetStateAction<string>>,
  classes: Record<string, string>,
) => {
  return (
    <TextField
      className={classes.searchField}
      label={`Search by ${searchType}`}
      variant="outlined"
      size="small"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder={getPlaceholder(searchType)}
    />
  );
};

export const Content = ({ owner, repo }: CloudsmithPackageListContentProps) => {
  const classes = useStyles();
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const cloudsmithApi = useMemo(
    () =>
      new CloudsmithClient({
        fetchApi,
        discoveryApi,
      }),
    [fetchApi, discoveryApi],
  );

  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('custom');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(0);

  const fetchPackages = useCallback(async () => {
    const response = await cloudsmithApi.getPackagesList({
      owner,
      repo,
      query: searchQuery,
      page: 1,
      pageSize: 500,
    });
    return response;
  }, [cloudsmithApi, owner, repo, searchQuery]);

  const [{ value: packagesData, loading, error }, execute] = useAsyncFn(
    fetchPackages,
    [fetchPackages],
  );

  useEffect(() => {
    execute();
  }, [execute]);

  const handleSearchTypeChange = (
    event: ChangeEvent<{ value: unknown }>,
  ) => {
    setSearchType(event.target.value as string);
    setQuery('');
  };

  const handlePackageClick = (packageData: Package) => {
    setSelectedPackage(packageData);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSearch = () => {
    let formattedQuery = query;
    if (searchType !== 'custom') {
      formattedQuery = `${searchType}:${query}`;
    }
    setSearchQuery(formattedQuery);
    execute();
  };

  const handleClearFilters = () => {
    setSearchType('custom');
    setQuery('');
    setSearchQuery('');
    execute();
  };

  const handleTagClick = useCallback(
    (event: MouseEvent, tag: string) => {
      event.stopPropagation();
      setSearchType('tag');
      setQuery(tag.split(':')[1]);
      setSearchQuery(`tag:${tag.split(':')[1]}`);
      execute();
    },
    [execute],
  );

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Name',
        field: 'name',
        render: (rowData: Package) => (
          <Typography variant="body2">
            {rowData.name}
            {rowData.self_html_url && (
              <Tooltip title="View in Cloudsmith UI">
                <IconButton
                  size="small"
                  href={rowData.self_html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '8px' }}
                >
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Typography>
        ),
      },
      { title: 'Version', field: 'version' },
      { title: 'Format', field: 'format' },
      {
        title: 'Created At',
        field: 'uploaded_at',
        render: (rowData: Package) =>
          new Date(rowData.uploaded_at).toLocaleString(),
      },
      {
        title: 'Status',
        field: 'status_str',
        render: (rowData: Package) => (
          <Chip
            label={rowData.status_str}
            color={rowData.status === 4 ? 'primary' : 'default'}
            size="small"
            className={classes.chip}
          />
        ),
      },
      {
        title: 'Tags',
        field: 'tags',
        render: (rowData: Package) => (
          <Box
            display="flex"
            flexWrap="wrap"
            onClick={e => e.stopPropagation()}
          >
            {parseTags(rowData.tags || {}).map((tag, index) => (
              <Tooltip title={`Search for ${tag}`} key={index}>
                <Chip
                  icon={<LabelIcon />}
                  label={tag.split(':')[1]}
                  onClick={e => handleTagClick(e, tag)}
                  className={classes.tagChip}
                  size="small"
                />
              </Tooltip>
            ))}
          </Box>
        ),
      },
      {
        title: 'Actions',
        render: (rowData: Package) => (
          <Box>
            <Tooltip title="Download">
              <IconButton
                size="small"
                href={rowData.cdn_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [classes.chip, classes.tagChip, handleTagClick],
  );

  const tableOptions = {
    search: false,
    paging: true,
    pageSize: pageSize,
    pageSizeOptions: [15, 30, 50, 100],
    emptyRowsWhenPaging: false,
    sorting: true,
    onChangeRowsPerPage: handleChangeRowsPerPage,
    onPageChange: handleChangePage,
    page: page,
  };

  if (loading) {
    return (
      <InfoCard title={`Packages for ${repo}`}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress />
          <Typography variant="body1" style={{ marginLeft: '16px' }}>
            Loading packages...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  if (error || !packagesData) {
    return (
      <ErrorPanel error={error || new Error('Packages list was not found')} />
    );
  }

  return (
    <InfoCard title={`Packages for ${repo}`}>
      <Box className={classes.searchContainer}>
        <FormControl className={classes.searchTypeSelect}>
          <InputLabel id="search-type-label">Search By</InputLabel>
          <Select
            labelId="search-type-label"
            value={searchType}
            onChange={handleSearchTypeChange}
          >
            {searchOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {renderSearchInput(searchType, query, setQuery, classes)}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
        {/* Conditionally render Clear Filters button */}
        {(searchType !== 'custom' || searchQuery) && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
            style={{ marginLeft: '8px' }}
          >
            Clear Filters
          </Button>
        )}
      </Box>
      {searchType === 'custom' && (
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginBottom: '16px' }}
        >
          Cloudsmith Custom Query Example: name:package AND version:&gt;1.0 AND
          format:npm
          <br />
          <Link
            href="https://help.cloudsmith.io/docs/search-packages"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about Cloudsmith package queries
          </Link>
        </Typography>
      )}
      {searchType === 'tag' && (
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginBottom: '16px' }}
        >
          Tag Search Example: Linux
        </Typography>
      )}

      <Box
        mb={2}
        p={2}
        bgcolor="info.main"
        color="info.contrastText"
        borderRadius={4}
      >
        <Typography
          variant="body2"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <InfoOutlinedIcon fontSize="small" style={{ marginRight: '8px' }} />
          Note: Due to proxy limitations, we can only display up to 500
          packages. Use the search functionality to find specific packages if
          they're not visible in the current list.
        </Typography>
      </Box>

      <Table
        options={tableOptions}
        columns={columns}
        data={packagesData?.packages || []}
        onRowClick={(_, rowData) => handlePackageClick(rowData as Package)}
      />
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedPackage?.name}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedPackage && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} className={classes.dialogContent}>
                  <Typography variant="h6" gutterBottom>
                    Package Details
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>Name:</strong> {selectedPackage.name}
                    {selectedPackage.self_html_url && (
                      <Button
                        href={selectedPackage.self_html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<LaunchIcon />}
                        size="small"
                        style={{ marginLeft: '8px' }}
                      >
                        View in Cloudsmith
                      </Button>
                    )}
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>Version:</strong> {selectedPackage.version}
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>Format:</strong> {selectedPackage.format}
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>License:</strong> {selectedPackage.license}
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>Size:</strong>{' '}
                    {((selectedPackage.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>Uploader:</strong> {selectedPackage.uploader}
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>Tags:</strong>
                  </Typography>
                  <Box display="flex" flexWrap="wrap">
                    {parseTags(selectedPackage.tags || {}).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag.split(':')[1]}
                        className={classes.chip}
                        size="small"
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} className={classes.dialogContent}>
                  <Typography variant="h6" gutterBottom>
                    Security & Status
                  </Typography>
                  <Typography
                    variant="body2"
                    className={classes.securityStatus}
                  >
                    <SecurityIcon className={classes.securityIcon} />
                    <strong>Security Scan Status:</strong>{' '}
                    {selectedPackage.security_scan_status}
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>Last Scan:</strong>{' '}
                    {selectedPackage.security_scan_status_updated_at
                      ? new Date(
                          selectedPackage.security_scan_status_updated_at,
                        ).toLocaleString()
                      : 'N/A'}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={classes.securityStatus}
                  >
                    <SyncIcon className={classes.securityIcon} />
                    <strong>Sync Status:</strong> {selectedPackage.stage_str}
                  </Typography>
                  <Typography variant="body2" className={classes.metadataItem}>
                    <strong>Last Updated:</strong>{' '}
                    {selectedPackage.stage_updated_at
                      ? new Date(
                          selectedPackage.stage_updated_at,
                        ).toLocaleString()
                      : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
              {selectedPackage.description && (
                <Grid item xs={12}>
                  <Paper elevation={1} className={classes.dialogContent}>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedPackage.description}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              <Grid item xs={12}>
                <Paper elevation={1} className={classes.dialogContent}>
                  <Typography variant="h6" gutterBottom>
                    Files
                  </Typography>
                  <List className={classes.filesList}>
                    {selectedPackage.files?.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={file.filename}
                          secondary={`Size: ${(file.size / 1024).toFixed(
                            2,
                          )} KB | Downloads: ${file.downloads}`}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Download File">
                            <IconButton
                              edge="end"
                              aria-label="download"
                              href={file.cdn_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )) ?? []}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          {selectedPackage?.cdn_url && (
            <Button
              href={selectedPackage.cdn_url}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              Download Package
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </InfoCard>
  );
};
