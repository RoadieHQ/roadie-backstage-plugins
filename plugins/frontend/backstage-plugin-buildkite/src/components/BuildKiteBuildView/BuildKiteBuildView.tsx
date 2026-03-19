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

import { FC, useEffect } from 'react';
import {
  Typography,
  Grid,
  Breadcrumbs,
  IconButton,
  makeStyles,
  Box,
} from '@material-ui/core';
import {
  InfoCard,
  Page,
  Content,
  Link as MaterialLink,
} from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';
import { Entity } from '@backstage/catalog-model';
import LaunchIcon from '@material-ui/icons/Launch';
import { BuildkiteBuildStep } from './components/BuildkiteBuildStep';
import { useSingleBuild } from '../useSingleBuild';
import { useProjectEntity } from '../useProjectEntity';
import { BuildkiteBuildInfo, BuildkiteJob } from '../types';

const useStyles = makeStyles(theme => ({
  neutral: {},
  failed: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.error.main}`,
    },
  },
  running: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.info.main}`,
    },
  },
  cardContent: {
    backgroundColor: theme.palette.background.default,
    padding: '0!important',
  },
  success: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.success.main}`,
    },
  },
}));

const BuildName: FC<{ build: BuildkiteBuildInfo }> = ({ build }) => (
  <Box display="flex" alignItems="center">
    #{build?.number} - {build?.message}
    <IconButton
      href={build?.web_url as string}
      target="_blank"
      rel="noopener noreferrer"
    >
      <LaunchIcon />
    </IconButton>
  </Box>
);

const pickClassName = (
  classes: ReturnType<typeof useStyles>,
  build: BuildkiteJob,
) => {
  if (build.state === 'failed') return classes.failed;
  if (['running', 'queued', 'scheduled', 'assigned'].includes(build.state))
    return classes.running;
  if (build.state === 'passed') return classes.success;
  return classes.neutral;
};

const ActionsList: FC<{ jobs: BuildkiteJob[] }> = ({ jobs }) => {
  const classes = useStyles();
  return (
    <>
      {jobs.map((job: BuildkiteJob) => (
        <BuildkiteBuildStep
          className={pickClassName(classes, job)}
          job={job}
          key={job.id}
        />
      ))}
    </>
  );
};

const BuildsList: FC<{ build: BuildkiteBuildInfo }> = ({ build }) => (
  <Box>
    {build.jobs ? (
      <ActionsList jobs={build.jobs} />
    ) : (
      <Alert severity="error">Jobs list is empty</Alert>
    )}
  </Box>
);

const BuildkiteBuildView: FC<{ entity: Entity }> = ({ entity }) => {
  const classes = useStyles();
  const { buildNumber } = useParams() as any;
  const { owner, repo } = useProjectEntity(entity);
  const { value, error, fetchBuildData } = useSingleBuild({
    owner,
    repo,
    buildNumber,
  });

  useEffect(() => {
    fetchBuildData();
  }, [fetchBuildData]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (value?.state === 'running' || value?.state === 'scheduled') {
      timer = setTimeout(() => {
        fetchBuildData();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [value, fetchBuildData]);

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return value ? (
    <Page themeId="tool">
      <Content>
        <Breadcrumbs aria-label="breadcrumb">
          <MaterialLink to="..">All builds</MaterialLink>
          <Typography>Build details</Typography>
        </Breadcrumbs>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <Box mt={3}>
              <InfoCard
                title={<BuildName build={value} />}
                cardClassName={classes.cardContent}
              />
              <BuildsList build={value} />
            </Box>
          </Grid>
        </Grid>
      </Content>
    </Page>
  ) : null;
};

export default BuildkiteBuildView;
