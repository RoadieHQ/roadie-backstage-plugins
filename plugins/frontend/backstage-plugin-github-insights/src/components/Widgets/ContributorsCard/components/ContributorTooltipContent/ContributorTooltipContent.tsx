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

import { Avatar, Box, Divider, Grid, Link, makeStyles, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Progress } from '@backstage/core-components';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { useEntityGithubScmIntegration } from '../../../../../hooks/useEntityGithubScmIntegration';
import { useContributor } from '../../../../../hooks/useContributor';
import { useEntity } from '@backstage/plugin-catalog-react';

const useStyles = makeStyles(theme => ({
  contributorsTooltipContainer: {
    padding: theme.spacing(1, 0),
  },
}));

type Props = {
  contributorLogin: string;
};
const ContributorTooltipContent = ({ contributorLogin }: Props) => {
  const classes = useStyles();
  const { entity } = useEntity();
  const { hostname } = useEntityGithubScmIntegration(entity);
  const { contributor, loading } = useContributor(contributorLogin);

  if (loading) {
    return <Progress />;
  } else if (!contributor?.login) {
    return <Alert severity="error">Fetching failed!</Alert>;
  }

  return (
    <Grid container className={classes.contributorsTooltipContainer}>
      <Grid item xs={12} sm={2}>
        <Avatar
          key={contributor.login}
          alt={contributor.login}
          src={contributor.avatar_url}
        />
      </Grid>
      <Grid item xs={12} sm={10}>
        <Grid item xs={12}>
          <Typography variant="h6">
            <Link
              href={`https://${hostname}/${contributor.login}`}
              color="inherit"
              target="_blank"
              rel="noopener noreferrer"
            >
              {contributor.name}
            </Link>
            <Box component="span" ml={2}>
              <Typography variant="caption">{contributor.login}</Typography>
            </Box>
          </Typography>
        </Grid>
        {contributor.bio && (
          <Grid item xs={12}>
            <Typography variant="subtitle2">{contributor.bio}</Typography>
          </Grid>
        )}
        {contributor.location && (
          <Grid item xs={12}>
            <Box my={2}>
              <Divider />
            </Box>
            <Typography variant="caption">
              <LocationOnIcon fontSize="inherit" /> {contributor.location}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default ContributorTooltipContent;
