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

import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { LineChart } from './LineChart';
import { useStyles } from '../../style';
import { Typography } from '@material-ui/core';
import wizLogo from '../../assets/wiz-logo.png';
import { useIssues } from '../IssuesContext';

export const IssuesChart = () => {
  const classes = useStyles();
  const { issues: value, loading, error } = useIssues();

  const WizIcon = () => {
    return <img src={wizLogo} alt="WIZ Logo" className={classes.logo} />;
  };

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <InfoCard
      title="Issues status graph"
      subheader="Status (resolved vs. open) of the last 500 issues created within the past 6 months."
      headerProps={{
        action: <WizIcon />,
        classes: {
          root: classes.card,
        },
      }}
    >
      {value && value.length > 0 ? (
        <LineChart issues={value} />
      ) : (
        <Typography>There are no issues for this project</Typography>
      )}
    </InfoCard>
  );
};
