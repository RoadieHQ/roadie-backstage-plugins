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

import { makeStyles, Tooltip } from '@material-ui/core';
import { PullRequest } from './usePullRequests';
import { GithubSearchPullRequestsDataItem } from '../types';

const useStyles = makeStyles(() => ({
  open: {
    fill: '#22863a',
    verticalAlign: 'sub',
  },
  closed: {
    fill: '#cb2431',
    verticalAlign: 'sub',
  },
  merged: {
    fill: '#6f42c1',
    verticalAlign: 'sub',
  },
  draft: {
    fill: '#6a737d',
    verticalAlign: 'sub',
  },
  comment: {
    fill: '#768390',
    verticalAlign: 'sub',
  },
}));

const StatusOpen = () => {
  const classes = useStyles();
  return (
    <svg width="16" height="16" className={classes.open} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"
      />
    </svg>
  );
};

const StatusClosed = () => {
  const classes = useStyles();
  return (
    <svg width="16" height="16" className={classes.closed} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"
      />
    </svg>
  );
};

const StatusMerged = () => {
  const classes = useStyles();
  return (
    <svg width="16" height="16" className={classes.merged} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        d="M5 3.254V3.25v.005a.75.75 0 110-.005v.004zm.45 1.9a2.25 2.25 0 10-1.95.218v5.256a2.25 2.25 0 101.5 0V7.123A5.735 5.735 0 009.25 9h1.378a2.251 2.251 0 100-1.5H9.25a4.25 4.25 0 01-3.8-2.346zM12.75 9a.75.75 0 100-1.5.75.75 0 000 1.5zm-8.5 4.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
      />
    </svg>
  );
};

const StatusDraft = () => {
  const classes = useStyles();
  return (
    <svg width="16" height="16" className={classes.draft} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"
      />
    </svg>
  );
};
export const CommentIcon = () => {
  const classes = useStyles();
  return (
    <svg width="16" height="16" className={classes.comment} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        d="M2.75 2.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 01.75.75v2.19l2.72-2.72a.75.75 0 01.53-.22h4.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25H2.75zM1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0113.25 12H9.06l-2.573 2.573A1.457 1.457 0 014 13.543V12H2.75A1.75 1.75 0 011 10.25v-7.5z"
      />
    </svg>
  );
};

export const getStatusIconType = (
  row: PullRequest | GithubSearchPullRequestsDataItem,
) => {
  switch (true) {
    case row.state === 'open' && row.draft:
      return (
        <Tooltip title="Draft">
          <span>
            <StatusDraft />
          </span>
        </Tooltip>
      );
    case row.state === 'open':
      return (
        <Tooltip title="Open">
          <span>
            <StatusOpen />
          </span>
        </Tooltip>
      );
    case row.state === 'closed' && Boolean(row.merged):
      return (
        <Tooltip title="Merged">
          <span>
            <StatusMerged />
          </span>
        </Tooltip>
      );
    case row.state === 'closed':
      return (
        <Tooltip title="Closed">
          <span>
            <StatusClosed />
          </span>
        </Tooltip>
      );
    default:
      return null;
  }
};
