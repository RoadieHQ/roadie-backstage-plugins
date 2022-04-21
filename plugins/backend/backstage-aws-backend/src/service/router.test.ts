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

import { createRouter } from './router';
import express, { Express } from 'express';
import { ConfigReader } from '@backstage/config';
import request from 'supertest';
import { getVoidLogger } from '@backstage/backend-common';
import { CloudControl, GetResourceCommand } from '@aws-sdk/client-cloudcontrol';
import { mockClient } from 'aws-sdk-client-mock';

const cloudControl = mockClient(CloudControl);

const logger = getVoidLogger();
const config = ConfigReader.fromConfigs([
  {
    context: '',
    data: {
      integrations: {
        aws: [
          {
            accountId: '99999999999',
            roleArn: 'arn:aws:iam::99999999999:role/ops',
          },
        ],
      },
    },
  },
]);

describe('router', () => {
  let app: Express;

  beforeEach(async () => {
    const router = await createRouter({ config, logger });
    cloudControl
      .on(GetResourceCommand, {
        Identifier: 'mybucket',
        TypeName: 'AWS::S3::Bucket',
      })
      .resolves({
        ResourceDescription: {
          Identifier: 'mybucket',
          Properties: JSON.stringify({
            BucketName: 'mybucket',
          }),
        },
        TypeName: 'AWS::S3::Bucket',
      });
    app = express().use(router);
  });

  it('returns the requested data', async () => {
    const response = await request(app).get(
      '/99999999999/AWS::S3::Bucket/mybucket',
    );
    const firstCall = cloudControl.call(0);
    expect(firstCall.args[0].input).toMatchObject({
      Identifier: 'mybucket',
      TypeName: 'AWS::S3::Bucket',
    });

    expect(response.body).toEqual({
      BucketName: 'mybucket',
    });
  });
});
