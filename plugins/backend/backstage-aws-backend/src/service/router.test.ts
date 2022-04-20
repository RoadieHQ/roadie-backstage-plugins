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
      aws: {
        accounts: [
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
