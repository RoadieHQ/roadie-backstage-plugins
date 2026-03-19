/*
 * Copyright 2025 Larder Software Limited
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

import { useApi } from '@backstage/core-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';
import { Button, Grid, Tooltip, Typography } from '@material-ui/core';
import { useCallback } from 'react';

export const GithubNotAuthorized = ({
  hostname = 'github.com',
  addLoginStatus,
}: {
  hostname?: string;
  addLoginStatus: () => void;
}) => {
  const scmAuth = useApi(scmAuthApiRef);

  const signIn = useCallback(async () => {
    const credentials = await scmAuth.getCredentials({
      url: `https://${hostname}/`,
      additionalScope: {
        customScopes: {
          github: ['repo'],
        },
      },
    });
    if (credentials.token) {
      addLoginStatus();
    }
  }, [scmAuth, hostname, addLoginStatus]);

  return (
    <Grid container>
      <Grid item xs={8}>
        <Typography>
          You are not logged into GitHub. You need to be signed in to see the
          content of this card.
        </Typography>
      </Grid>
      <Grid item xs={4} container justifyContent="flex-end">
        <Tooltip placement="top" arrow title="Sign in to Github">
          <Button variant="outlined" color="primary" onClick={signIn}>
            Sign in
          </Button>
        </Tooltip>
      </Grid>
    </Grid>
  );
};
