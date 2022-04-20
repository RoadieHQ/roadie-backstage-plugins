import React from 'react';
import { WhosOutContentProps, TimeOff } from './types';
import { useWhosOut } from './api';
import { Progress } from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

export const Content = ({ start_time, end_time }: WhosOutContentProps) => {
  const { loading, value, error } = useWhosOut(start_time, end_time);

  if (loading) {
    return <Progress>Loading time off..</Progress>;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Grid container>
      {value.length > 0 ? (
        value.map((v: TimeOff, i: number) => {
          return (
            <Grid item key={i}>
              {v.type === 'timeOff' ? (
                <Typography>{`${v.name} is off from ${v.start} to ${v.end}`}</Typography>
              ) : (
                <Typography>{`${v.name} is a holiday from ${v.start} to ${v.end}`}</Typography>
              )}
            </Grid>
          );
        })
      ) : (
        <Typography>
          Looks like there are no planned days off! Get back to work ;)
        </Typography>
      )}
    </Grid>
  );
};
