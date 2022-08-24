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

import { useAsync, useAsyncRetry } from 'react-use';
import {
  useApi,
  errorApiRef,
  configApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { LambdaData } from '../types';
import { awsLambdaApiRef } from '../api';
import { useCallback } from 'react';

export function useLambda({
  lambdaName,
  region,
}: {
  lambdaName: string;
  region: string;
}) {
  const lambdaApi = useApi(awsLambdaApiRef);
  const errorApi = useApi(errorApiRef);
  const configApi = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);

  const identity = useAsync(async () => {
    return await identityApi.getCredentials();
  });

  const getFunctionByName = useCallback(
    async () => {
      return await lambdaApi.getFunctionByName({
        backendUrl: configApi.getString('backend.baseUrl'),
        awsRegion: region,
        functionName: lambdaName,
        token: identity.value?.token || undefined,
      });
    },
    [region, lambdaName], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const {
    loading,
    value: lambda,
    error,
    retry,
  } = useAsyncRetry<LambdaData | null>(async () => {
    try {
      const lambdaFunction = await getFunctionByName();
      return lambdaFunction;
    } catch (e) {
      if (e instanceof Error) {
        if (e?.message === 'MissingBackendAwsAuthException') {
          errorApi.post(new Error('Please add aws auth backend plugin'));
          return null;
        }
        errorApi.post(e);
      }
      return null;
    }
  }, []);

  return [
    {
      loading,
      lambda,
      error,
      retry,
    },
  ] as const;
}
