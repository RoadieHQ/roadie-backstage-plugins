import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { ScmAuthApi, scmAuthApiRef } from '@backstage/integration-react';

export const useGithubLoggedIn = (hostname: string = 'github.com') => {
  const scmAuth: ScmAuthApi = useApi(scmAuthApiRef);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const doLogin = async () => {
      const credentials = await scmAuth.getCredentials({
        additionalScope: {
          customScopes: { github: ['repo'] },
        },
        url: `https://${hostname}`,
        optional: true,
      });

      if (credentials?.token) {
        setIsLoggedIn(true);
      }
    };

    doLogin();
  }, [hostname, scmAuth]);

  return isLoggedIn;
};
