import {
  scmAuthApiRef,
  ScmAuthTokenResponse,
} from '@backstage/integration-react';
import { useApi } from '@backstage/core-plugin-api';
import React, { useCallback, useState } from 'react';
import { Button, Grid, Tooltip, Typography } from '@material-ui/core';
import { useGithubLoggedIn } from './useGithubLoggedIn';
import { InfoCard } from '@backstage/core-components';

export const GithubNotAuthorized = ({
  hostname = 'github.com',
  validateCredentials,
}: {
  hostname?: string;
  validateCredentials: (credentials: ScmAuthTokenResponse) => void;
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
    validateCredentials(credentials);
  }, [scmAuth, hostname, validateCredentials]);

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

export const GitHubAuthorizationWrapper = ({
  children,
  title,
  hostname,
}: {
  children: React.ReactNode;
  title: string;
  hostname?: string;
}) => {
  const isLoggedIn = useGithubLoggedIn();
  const [credentialsValidated, setCredentialsValidated] = useState(false);
  const validateCredentials = useCallback(
    (credentials: ScmAuthTokenResponse) => {
      if (isLoggedIn) {
        return;
      }

      if (credentials.token) {
        setCredentialsValidated(true);
      }
    },
    [isLoggedIn],
  );
  return isLoggedIn || credentialsValidated ? (
    children
  ) : (
    <InfoCard title={title}>
      <GithubNotAuthorized
        validateCredentials={validateCredentials}
        hostname={hostname}
      />
    </InfoCard>
  );
};
