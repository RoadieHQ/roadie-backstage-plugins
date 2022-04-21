import React from 'react';
import { sortBy } from 'lodash';
import { DateTime } from 'luxon';
import { WhosOutContentProps, TimeOff } from './types';
import { useWhosOut } from './api';
import { Progress, InfoCard } from '@backstage/core-components';
import { Typography, Box, Button, SendIcon } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import bamboohrIcon from "./icons/icon.png";


export const getStartDate = (event: TimeOff) => {
  return DateTime.fromISO(event.start);
}

export const Content = ({ start_time, end_time }: WhosOutContentProps) => {
  const { loading, value, error } = useWhosOut(start_time, end_time);

  if (loading) {
    return <Progress>Loading time off..</Progress>;
  }

  if (error) {
    const message = `Could not get "who is out": ${error.message}`
    return <Alert severity="error">{message}</Alert>;
  }

  return (
    <InfoCard
      noPadding
      title={
        <Box display="flex" alignItems="center">
          <Box height={24} width={24} mr={1}>
            <img src={bamboohrIcon} alt="BambooHr" height="50px" width="50px"/>
          </Box>
          <Typography variant="h6">Time off</Typography>
        </Box>
      }
      deepLink={{
        link: 'https://app.bamboohr.com/login/',
        title: 'Go to bamboo',
      }}>
      <Box>
        {(!value || value.length === 0) && (
          <Box pt={2} pb={2}>
            <Typography align="center" variant="h6">
              Looks like there are no planned days off! Get back to work 😉
            </Typography>
          </Box>
        )}
        <Box  p={1} pb={0} maxHeight={300} overflow="auto">
          {sortBy(value, [getStartDate]).map((event: TimeOff, i) => {
            // 2022-04-21 -> April 21, 2022
            const s = DateTime.fromISO(event.start).toFormat('MMMM dd, yyyy');
            const e = DateTime.fromISO(event.end).toFormat('MMMM dd, yyyy')
            return (
              <Box flex={1} pt={1} pb={1} key={i} boxShadow={12}>
                {event.type === 'timeOff' ? (
                  <Typography>{`${event.name} is off from ${s} to ${e}`}</Typography>
                ) : (
                  <Typography>{`${event.name} is a public holiday from ${s} to ${e}`}</Typography>
                )}
              </Box>
            );
          })}
        </Box>
        <Button href="https://roadiehq.bamboohr.com/calendar">Go to calendar</Button>
      </Box>
    </InfoCard>
  );
};
