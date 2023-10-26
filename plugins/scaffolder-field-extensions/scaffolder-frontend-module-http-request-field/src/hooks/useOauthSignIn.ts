/*
 * Copyright 2023 Larder Software Limited
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
import {
  bitbucketAuthApiRef,
  githubAuthApiRef,
  googleAuthApiRef,
  microsoftAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { OAuthConfig } from '../types';

const oauthApiRefMap = {
  microsoft: microsoftAuthApiRef,
  github: githubAuthApiRef,
  google: googleAuthApiRef,
  bitbucket: bitbucketAuthApiRef,
};

export const useOauthSignIn = ({ provider, scopes }: OAuthConfig) => {
  const authApi = useApi(oauthApiRefMap[provider ?? 'github']);
  const [isSignedIn, setSignedIn] = useState(false);
  const [token, setToken] = useState('');
  const [forceLogin, setForceLogin] = useState(false);

  const doSignIn = useCallback(
    async (usePopup = true) => {
      const accessToken = await authApi.getAccessToken(scopes, {
        optional: !usePopup,
        instantPopup: usePopup,
      });
      if (accessToken) {
        setSignedIn(!!accessToken);
        setToken(accessToken);
      }
    },
    [authApi, setSignedIn, scopes],
  );

  const { loading, error } = useAsync(async () => {
    if (!isSignedIn) {
      await doSignIn(forceLogin);
    }
  }, [doSignIn, forceLogin, isSignedIn]);

  const showSignInModal = useCallback(() => {
    setForceLogin(true);
  }, [setForceLogin]);

  return { token, loading, error, isSignedIn, showSignInModal };
};
