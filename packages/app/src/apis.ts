import {
  AnyApiFactory, configApiRef, createApiFactory
} from '@backstage/core';
import {
  ScmIntegrationsApi, scmIntegrationsApiRef
} from '@backstage/integration-react';
import {
  awsLambdaApiRef,
  AwsLambdaClient,
} from '@roadiehq/backstage-plugin-aws-lambda'

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  createApiFactory(awsLambdaApiRef, new AwsLambdaClient()),
];
