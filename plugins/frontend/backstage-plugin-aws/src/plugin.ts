import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  DiscoveryApi,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { awsApiRef } from './api/AwsApi';
import { AwsClient } from './api/AwsClient';

export const awsPlugin = createPlugin({
  id: 'aws-frontend',
  apis: [
    createApiFactory({
      api: awsApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }: { discoveryApi: DiscoveryApi }) => {
        return new AwsClient({
          discoveryApi,
        });
      },
    }),
  ],
});

export const S3BucketCard = awsPlugin.provide(
  createComponentExtension({
    name: 'S3BucketCard',
    component: {
      lazy: () => import('./components/S3BucketCard').then(m => m.S3BucketCard),
    },
  }),
);
