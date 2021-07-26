/*
 * Copyright 2020 RoadieHQ
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

import AWS from 'aws-sdk';
import { AwsLambdaApi } from './AWSLambdaApi';
import { LambdaData } from '../types';

async function generateCredentials(backendUrl: string, options: {
  token: string | undefined
}) {
  const respData = await fetch(`${backendUrl}/api/aws/credentials`, {
    headers: {
      // Disable eqeqeq rule for next line to allow it to pick up both undefind and null
      // eslint-disable-next-line eqeqeq 
      ...(options == null ? void 0 : options.token) && {Authorization: `Bearer ${options == null ? void 0 : options.token}`}
    }
  });
  try {
    const resp = await respData.json();
    return new AWS.Credentials({
      accessKeyId: resp.AccessKeyId,
      secretAccessKey: resp.SecretAccessKey,
      sessionToken: resp.SessionToken,
    });
  } catch (e) {
    throw new Error('MissingBackendAwsAuthException');
  }
}
export class AwsLambdaClient implements AwsLambdaApi {
  async getFunctionByName({
    awsRegion,
    backendUrl,
    functionName,
    token
  }: {
    awsRegion: string;
    backendUrl: string;
    functionName: string;
    token?: string;
  }): Promise<LambdaData> {
    AWS.config.region = awsRegion;
    AWS.config.credentials = await generateCredentials(backendUrl, { token });
    const lambdaApi = new AWS.Lambda({});
    const resp = await lambdaApi
      .getFunction({
        FunctionName: functionName,
      })
      .promise();
    const v = resp.Configuration!;
    return {
      codeSize: v.CodeSize!,
      description: v.Description!,
      functionName: v.FunctionName!,
      lastModifiedDate: v.LastModified!,
      runtime: v.Runtime!,
      memory: v.MemorySize!,
      region: awsRegion,
      state: v.State!,
      lastUpdateStatus: v.LastUpdateStatus!,
      lastUpdateStatusReason: v.LastUpdateStatusReason!,
    };
  }
}
