export const entityMock = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/mcalus3/sample-service/blob/master/backstage9.yaml',
      'aws.com/lambda-function-name': 'openfraksl-dev-graphql',
      'aws.com/lambda-region': 'us-east-1',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: '8378becc-fadc-4bfe-b922-72eb0858f448',
    etag: 'MDZjZTliOTgtNWVkMC00MzVjLTk2OGQtMmRlNjliOGE3NTIx',
    generation: 1,
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  spec: {
    type: 'service',
    owner: 'david@roadie.io',
    lifecycle: 'experimental',
  },
  relations: [
    {
      target: { kind: 'group', namespace: 'default', name: 'david@roadie.io' },
      type: 'ownedBy',
    },
  ],
};

//  http://localhost:7000/api/aws/credentials
export const credentialsResponseMock = {
  AccessKeyId: 'test-key-id',
  SecretAccessKey: 'test-access-key',
  SessionToken:
    'FwoGZXIvYXdzEA8aDDbSh6OzHZFfqQrk9CKBAcAoBJ8CpcXf1CRHQLvodVu8maLiMjpYahpmXr2OfeRN2uYsIGcK8VF4J5d5PrYmbgZyrnEQPIrj0BZW7cVpxg5niEq/0QAvKJDOMHd5mRqpJVg8eGeoP5t2XH5yCfSEBJiF1xtO3RTv0u6vovZX6Ghgm0Lq2UYB7yOMcTsWI9YXHCjnnfj/BTIoepgsn/ZHrU9DSNTh5oapQ1xrClH+Jb0n6QSe5K7y3pohVPbVEzN4vA==',
  Expiration: '2021-01-12T21:19:39.000Z',
};

// https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/openfraksl-dev-graphql
export const lambdaResponseMock = {
  Configuration: {
    Description: '',
    TracingConfig: { Mode: 'PassThrough' },
    VpcConfig: null,
    SigningJobArn: null,
    RevisionId: '0abcd3ea-f2d1-4630-a229-19a74e6d6b03',
    LastModified: '2020-05-14T06:20:50.057+0000',
    FileSystemConfigs: null,
    FunctionName: 'openfraksl-dev-graphql',
    Runtime: 'nodejs12.x',
    Version: '$LATEST',
    PackageType: 'Zip',
    LastUpdateStatus: 'Successful',
    Layers: null,
    FunctionArn:
      'arn:aws:lambda:us-east-1:771804640669:function:openfraksl-dev-graphql',
    KMSKeyArn: null,
    MemorySize: 1024,
    ImageConfigResponse: null,
    LastUpdateStatusReason: null,
    DeadLetterConfig: null,
    Timeout: 6,
    Handler: 'dist/graphql.handler',
    CodeSha256: 'RABQVua9V3ByCvaBkdrH6Pn8bR0QWh9mxjgq7IsAXFI=',
    Role: 'arn:aws:iam::771804640669:role/openfraksl-dev-us-east-1-lambdaRole',
    SigningProfileVersionArn: null,
    MasterArn: null,
    CodeSize: 53213316,
    State: 'Active',
    StateReason: null,
    Environment: {
      Variables: {
        S3_BUCKET: 'openfraksl-dev-fractalimagesbucket-1dfzxpf6bkcen',
        S3_REGION: 'us-east-1',
        USER_TABLE: 'openfraksl-users-dev',
        SAVED_FRACTALS_TABLE: 'openfraksl-saved-fractals-dev',
      },
      Error: null,
    },
    StateReasonCode: null,
    LastUpdateStatusReasonCode: null,
  },
  Concurrency: null,
  Code: {
    ResolvedImageUri: null,
    RepositoryType: 'S3',
    ImageUri: null,
    Location:
      'https://prod-04-2014-tasks.s3.us-east-1.amazonaws.com/snapshots/771804640669/openfraksl-dev-graphql-0da06024-9d5a-4d88-98f3-903f68d6cfbc?versionId=NYJOxLdMNHOoKJtr8uhoOf.NAHG7I9Iz&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEP3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDB%2FOoBOXsm%2BgPQmlXZ9qNaPLDb4PL15LPRt9Zdq18dZAIgQfrX0SvNo8%2FEFCH%2BQQD06FBXB5ZwRgMTAF5L40cKFDAqvQMIxv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw3NDk2Nzg5MDI4MzkiDJSYzor0YrKRgVS%2F2yqRA94kbqIHedPHGVdqPdmw0cCsj3VCSzQ3Apcku7sTWHVy93WoMv2r3MbpU%2FDOkOiP0LBuXrnjbob2YN8snBAG310zPSGv7Njz%2FU3PNZOP6OvnvgeWDYyx4QmWmxLRRu3catc8BoRajMLB624IZ7D%2FGiPxObxkH%2FxJcliBbouI0hoSMzM6yA2SzUVzWvYKhqDtZ6uI3DFkj%2F3lNZ3WOfj5K2jhrraNJawCRoVEtbECkC9g2tT1Gl9KvBISJn9T%2BJBzwbaVxXV%2FA76g0ZGCQ76G3NDH2v8424EHxnL6qg8LOx9e6CSlCFq8JeJeFaCsnwnfgBXqMHqY1sY87ncus%2BMm2DJDvzsu1fOSMDRqhznrCQcCrdqGOTjo%2Bp7fE8VA9fpc8AbeDNlVoO7HED0Txye%2FwSo7lncQWYrOknERchvd9RIq9McIQ66ud763mHnEtipwhCub6gSV5juxCS3K7goAY1RTYTXW%2FjaM4e8G26nZkfY9o4PYxnyPUlK5xPbqOpuA1Hdr2jL2q4TJnOAG6o%2BaPZ2mMOmP%2BP8FOusBfkOw%2Bhe1JQyX1Aspl2IMPNR7yemfzJyEtx35J6NQMif4zgjHEIuZb8vCNlXWwni8VGwPLLc%2FtCy5bLJPrJc2j%2F6ecAyLd3Z8ZocjYYOMGwFI6NfuctGWO4W0IK2eVW%2BeQ4IgGqwT4xnRzzLS4N%2FTnCxjVRPz3vqrZ3A8Jo4MySZDEEJeGDVvhz8A4HLtGnCK6vOejf5ydBrdpA8MrxRq7D6MXv%2Foz0yeeLFdaCqqSyT4YPc3XZuph1XZJRXcitZTFB3aNyqAa725xCuTtFKpAloowBBzUpX7ctdzWIYu3jT0HSmaYjyPt053xA%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20210112T210439Z&X-Amz-SignedHeaders=host&X-Amz-Expires=600&X-Amz-Credential=ASIA25DCYHY3TMKPWB5P%2F20210112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8de0af44db387a6fd516670814546dd1be1095481fa7b23e22042e1048c199ce',
  },
  Tags: {
    'aws:cloudformation:stack-name': 'openfraksl-dev',
    'aws:cloudformation:stack-id':
      'arn:aws:cloudformation:us-east-1:771804640669:stack/openfraksl-dev/b066b9b0-9561-11ea-ab50-0e46d57ace87',
    STAGE: 'dev',
    'aws:cloudformation:logical-id': 'GraphqlLambdaFunction',
  },
};
