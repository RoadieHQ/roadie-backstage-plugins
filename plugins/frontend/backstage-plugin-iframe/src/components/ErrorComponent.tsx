import { Grid, Typography } from '@material-ui/core';

export const ErrorComponent = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <Grid container>
      <Grid item xs={8}>
        <Typography>{errorMessage}</Typography>
      </Grid>
    </Grid>
  );
};
