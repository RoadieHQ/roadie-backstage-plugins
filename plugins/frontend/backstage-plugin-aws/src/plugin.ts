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

import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  DiscoveryApi,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { awsApiRef } from './api/AwsApi';
import { AwsClient } from './api/AwsClient';
import { Entity } from '@backstage/catalog-model';
import {
  EKS_CLUSTER_ARN_ANNOTATION,
  LAMBDA_FUNCTION_ARN_ANNOTATION,
  S3_BUCKET_ARN_ANNOTATION,
  IAM_ROLE_ARN_ANNOTATION,
  IAM_USER_ARN_ANNOTATION,
} from './constants';

export const isEksClusterAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[EKS_CLUSTER_ARN_ANNOTATION]);
export const isS3BucketAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[S3_BUCKET_ARN_ANNOTATION]);
export const isIamRoleAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[IAM_ROLE_ARN_ANNOTATION]);
export const isIamUserAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[IAM_USER_ARN_ANNOTATION]);
export const isLambdaFunctionAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[LAMBDA_FUNCTION_ARN_ANNOTATION]);

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

export const LambdaFunctionCard = awsPlugin.provide(
  createComponentExtension({
    name: 'LambdaFunctionCard',
    component: {
      lazy: () =>
        import('./components/LambdaFunctionCard').then(
          m => m.LambdaFunctionCard,
        ),
    },
  }),
);

export const IAMUserCard = awsPlugin.provide(
  createComponentExtension({
    name: 'IAMUserCard',
    component: {
      lazy: () => import('./components/IAMUserCard').then(m => m.IAMUserCard),
    },
  }),
);

export const IAMRoleCard = awsPlugin.provide(
  createComponentExtension({
    name: 'IAMRoleCard',
    component: {
      lazy: () => import('./components/IAMRoleCard').then(m => m.IAMRoleCard),
    },
  }),
);

export const EKSClusterCard = awsPlugin.provide(
  createComponentExtension({
    name: 'EKSClusterCard',
    component: {
      lazy: () =>
        import('./components/EKSClusterCard').then(m => m.EKSClusterCard),
    },
  }),
);
