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

import { FC, Suspense, useEffect } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  LinearProgress,
  Typography,
  Box,
} from '@material-ui/core';

import { DateTime, Duration } from 'luxon';
import { LogViewer } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useLog } from '../../useLog';
import { generateRequestUrl } from '../../utils';

const useStyles = makeStyles({
  accordion: {
    margin: '0!important',
  },
  accordionDetails: {
    padding: 0,
  },
  button: {
    order: -1,
    marginRight: 0,
    marginLeft: '-20px',
  },
});

export const ActionOutput: FC<{
  url: string;
  job: any;
  className: string;
}> = ({ url, job, className }) => {
  const classes = useStyles();
  const { value, error, fetchLogs } = useLog(generateRequestUrl(url));

  useEffect(() => {
    fetchLogs();
  }, [job, fetchLogs]);

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  // eslint-disable-next-line no-nested-ternary
  const timeElapsed = job.finished_at
    ? Duration.fromMillis(
        DateTime.fromISO(job.finished_at)
          .diff(DateTime.fromISO(job.started_at))
          .toMillis(),
      ).toHuman()
    : job.started_at
    ? 'In Progress'
    : 'Pending';

  return value ? (
    <Accordion
      TransitionProps={{ unmountOnExit: true }}
      className={`${classes.accordion} ${className}`}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${name}-content`}
        id={`panel-${name}-header`}
        IconButtonProps={{
          className: classes.button,
        }}
      >
        <Typography variant="button">
          {job.name || job.command} ({timeElapsed})
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>
        {value.size === 0 ? (
          <Box ml={3}>
            <Typography variant="h3" component="h3">
              Job pending..
            </Typography>
          </Box>
        ) : (
          <Suspense fallback={<LinearProgress />}>
            <div style={{ height: '30vh', width: '100%' }}>
              <LogViewer text={value.content} />
            </div>
          </Suspense>
        )}
      </AccordionDetails>
    </Accordion>
  ) : null;
};
