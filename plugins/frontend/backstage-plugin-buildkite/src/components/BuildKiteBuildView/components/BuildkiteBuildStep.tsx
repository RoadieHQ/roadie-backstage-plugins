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

import { FC } from 'react';

import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import { ActionOutput } from './ActionOutput';

const useStyles = makeStyles(() => ({
  waiter: {
    marginLeft: '50%',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
}));

export const BuildkiteBuildStep: FC<{
  job: any;
  className: string;
}> = props => {
  const classes = useStyles();
  const { job } = props;
  switch (job.type) {
    case undefined:
      return <Alert severity="error">Undefined Build Job Type</Alert>;
    case 'waiter':
      return (
        <KeyboardArrowDownIcon
          className={classes.waiter}
          data-testid="waiter"
        />
      );
    default:
      return <ActionOutput {...props} url={job.log_url || ''} />;
  }
};
