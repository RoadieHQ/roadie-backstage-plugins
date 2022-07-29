/*
 * Copyright 2022 Larder Software Limited
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

export async function generateTemporaryCredentials(
  AWS_ACCESS_KEY_ID?: string,
  AWS_ACCESS_KEY_SECRET?: string,
  AWS_ROLE_ARN?: string,
) {
  const defaultSessionDuration: number = 900;
  if (AWS_ACCESS_KEY_ID && AWS_ACCESS_KEY_SECRET) {
    AWS.config.credentials = new AWS.Credentials({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_ACCESS_KEY_SECRET,
    });
  }

  if (AWS_ROLE_ARN) {
    return await new AWS.STS()
      .assumeRole({
        RoleArn: AWS_ROLE_ARN,
        RoleSessionName: 'backstage-plugin-aws-auth',
        DurationSeconds: defaultSessionDuration,
      })
      .promise();
  }

  return await new AWS.STS()
    .getSessionToken({
      DurationSeconds: defaultSessionDuration,
    })
    .promise();
}
