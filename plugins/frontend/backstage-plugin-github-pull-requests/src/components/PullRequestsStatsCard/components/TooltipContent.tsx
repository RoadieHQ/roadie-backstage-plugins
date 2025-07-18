import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useTooltipContentStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.paper,
    fontSize: '1rem',
    fontWeight: Number(theme.typography.fontWeightBold),
    borderRadius: '6px',
    boxShadow: theme.shadows[10],
  },
  additions: {
    color: theme.palette.success.main,
  },
  deletions: {
    color: theme.palette.error.main,
  },
}));
export const TooltipContent = (props: {
  additions?: number;
  deletions?: number;
}) => {
  const { additions, deletions } = props;
  const classes = useTooltipContentStyles();

  return (
    <Grid container className={classes.container}>
      <Grid item className={classes.additions}>
        +{additions}
      </Grid>
      <Grid item className={classes.deletions}>
        -{deletions}
      </Grid>
    </Grid>
  );
};
