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

import { FC } from 'react';
import { Gauge } from '@backstage/core-components';
import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  gaugeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  usageText: {
    marginTop: theme.spacing(1),
  },
}));

type UsageGaugeProps = {
  title: string;
  used: number;
  configured: number;
  planLimit: number;
};

export const UsageGauge: FC<UsageGaugeProps> = ({
  title,
  used,
  configured,
  planLimit,
}) => {
  const classes = useStyles();

  const percentageUsed = Math.min((used / planLimit) * 100, 100);
  const isOverage = used > planLimit;
  const overageAmount = isOverage ? used - planLimit : 0;
  const overageAllowed = configured - planLimit;

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className={classes.gaugeContainer}>
      <Typography variant="h6">{title}</Typography>
      <Gauge value={percentageUsed} max={100} />
      <Typography variant="body2" className={classes.usageText}>
        {formatBytes(used)} / {formatBytes(planLimit)} (
        {percentageUsed.toFixed(2)}%)
      </Typography>
      <Typography variant="body2" className={classes.usageText}>
        Plan Limit: {formatBytes(planLimit)}
      </Typography>
      {isOverage && (
        <Typography variant="body2" color="error">
          Overage: {formatBytes(overageAmount)}
        </Typography>
      )}
      {overageAllowed > 0 && (
        <Typography variant="body2">
          Overage allowed: {formatBytes(overageAllowed)}
        </Typography>
      )}
    </div>
  );
};
