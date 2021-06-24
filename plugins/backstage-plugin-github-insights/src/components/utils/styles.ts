import {
  makeStyles,
} from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';

export const styles = makeStyles<BackstageTheme>(theme => ({
  card: {
    boxShadow: 'none',
  },
  protectedBranches: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
  },
  listStyle: {
    paddingTop: 0,
    '& :nth-child(1)': {
      paddingTop: '0.1rem',
    },
  },
  releaseTitle: {
    fontSize: '1.1rem',
    fontWeight: theme.typography.fontWeightMedium,
    margin: 0,
    marginRight: '0.5rem',
  },
  releaseTagIcon: {
    verticalAlign: 'middle',
  },
  listItem: {
    justifyContent: 'space-between'
  },
}));
