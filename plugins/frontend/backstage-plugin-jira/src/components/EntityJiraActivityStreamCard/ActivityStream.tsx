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
  Box,
  Divider,
  Link,
  Paper,
  Typography,
  Tooltip,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core';
import { Progress } from '@backstage/core-components';
import parse, {
  domToReact,
  attributesToProps,
  DomElement,
} from 'html-react-parser';
import sanitizeHtml from 'sanitize-html';
import { useActivityStream } from '../../hooks';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.type === 'dark' ? '#333' : '#f6f8fa',
      color: theme.palette.text.primary,
      marginTop: theme.spacing(1),
      overflowY: 'auto',
      maxHeight: '290px',
      '& a': {
        color: theme.palette.primary.main,
      },
      '& hr': {
        backgroundColor: theme.palette.divider,
        margin: theme.spacing(1, 0),
      },
      '& blockquote': {
        background: theme.palette.type === 'dark' ? '#424242' : '#e0f0ff',
        borderLeft: '1px solid #c2d9ef',
        color: theme.palette.text.primary,
        fontStyle: 'normal',
        margin: theme.spacing(1, 0),
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: theme.spacing(0, 1),
      },
      '& > :last-child > hr': {
        display: 'none',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: theme.palette.type === 'dark' ? '#555' : '#F5F5F5',
        borderRadius: '5px',
      },
      '&::-webkit-scrollbar': {
        width: '5px',
        backgroundColor: theme.palette.type === 'dark' ? '#555' : '#F5F5F5',
        borderRadius: '5px',
      },
      '&::-webkit-scrollbar-thumb': {
        border: `1px solid ${
          theme.palette.type === 'dark' ? '#555' : '#F5F5F5'
        }`,
        backgroundColor: theme.palette.type === 'dark' ? '#F5F5F5' : '#555',
        borderRadius: '4px',
      },
      '& span': {
        fontSize: '0.7rem',
      },
    },
    time: {
      lineHeight: 0,
      marginLeft: theme.spacing(1),
    },
    timeNoIcon: {
      lineHeight: 0,
      margin: '8px 0',
    },
    link: {
      cursor: 'pointer',
    },
  }),
);

const options = {
  replace: (node: DomElement) => {
    if (!node) return null;

    if (node.name === 'a') {
      // Add target blank to all urls
      const props = attributesToProps(
        node.attribs as { [key: string]: string },
      );
      return (
        <a {...props} target="_blank" rel="noopener noreferrer">
          {node.children && domToReact(node.children)}
        </a>
      );
    }
    return null;
  },
};

export const ActivityStream = ({
  projectKey,
  tokenType,
  componentName,
  ticketIds,
  label,
}: {
  projectKey: string;
  tokenType: string | undefined;
  componentName: string | undefined;
  ticketIds: string[] | undefined;
  label: string | undefined;
}) => {
  const classes = useStyles();
  const [size, setSize] = useState(25);
  const [disableButton, setDisableButton] = useState(false);
  const isBearerAuth = tokenType?.includes('Bearer') ? true : false;
  const { activities, activitiesLoading, activitiesError } = useActivityStream(
    size,
    projectKey,
    componentName,
    ticketIds,
    label,
    isBearerAuth,
  );

  const showMore = useCallback(() => {
    setSize(size + 10);
    if (activities && activities.length < size) {
      setDisableButton(true);
    }
  }, [size, activities]);

  if (activitiesError) return null; // Hide activity stream on error
  const filteredIssues = activities?.filter(
    entry => !entry?.icon?.title.includes('Sub-task'),
  );
  return (
    <Paper className={classes.paper}>
      {activitiesLoading ? <Progress /> : null}
      {filteredIssues ? (
        <>
          {filteredIssues.map(entry => (
            <Box key={entry.id}>
              {parse(entry.title, options)}
              <Box>
                {parse(
                  sanitizeHtml(entry.summary || entry.content || '', {
                    disallowedTagsMode: 'escape',
                  }),
                  options,
                )}
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                {entry.icon ? (
                  <Tooltip title={entry.icon.title}>
                    <img src={entry.icon.url} alt={entry.icon.title} />
                  </Tooltip>
                ) : null}
                <Tooltip title={entry.time.value}>
                  <Typography
                    variant="caption"
                    className={entry.icon ? classes.time : classes.timeNoIcon}
                  >
                    {entry.time.elapsed}
                  </Typography>
                </Tooltip>
              </Box>
              <Divider />
            </Box>
          ))}
          <Box display="flex" justifyContent="center" pt={1}>
            {disableButton ? (
              'No more activities'
            ) : (
              <Link onClick={showMore} className={classes.link}>
                {activitiesLoading ? 'Loading..' : 'Show more..'}
              </Link>
            )}
          </Box>
        </>
      ) : null}
    </Paper>
  );
};
