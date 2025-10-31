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
import { makeStyles } from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';

// @ts-ignore
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
    marginBottom: '10px',
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
    justifyContent: 'space-between',
  },
}));
