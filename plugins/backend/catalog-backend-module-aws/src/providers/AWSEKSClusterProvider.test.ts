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
  EKS,
  ListClustersCommand,
  DescribeClusterCommand,
} from '@aws-sdk/client-eks';
import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSEKSClusterProvider } from './AWSEKSClusterProvider';
import {
  ANNOTATION_AWS_EKS_CLUSTER_ARN,
  ANNOTATION_AWS_IAM_ROLE_ARN,
} from '../annotations';

const eks = mockClient(EKS);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSEKSClusterProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there is no clusters', () => {
    beforeEach(() => {
      eks.on(ListClustersCommand).resolves({
        clusters: [],
      });
    });

    it('creates no clusters', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEKSClusterProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there are is a cluster', () => {
    beforeEach(() => {
      eks.on(ListClustersCommand).resolves({
        clusters: ['cluster1'],
      });
      eks.on(DescribeClusterCommand).resolves({
        cluster: {
          name: 'cluster1',
          roleArn: 'arn:aws:iam::123456789012:role/cluster1',
          arn: 'arn:aws:eks:eu-west-1:123456789012:cluster/cluster1',
          tags: {
            some_url: 'https://asdfhwef.com/hello-world',
          },
        },
      });
    });

    it('creates eks cluster', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEKSClusterProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                labels: {
                  some_url: 'https---asdfhwef.com-hello-world',
                },
                name: 'a140791d2b20a847f2c74c62c384f93fb83691d871e80385720bce696a0a05f',
                title: '123456789012:eu-west-1:cluster1',
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_EKS_CLUSTER_ARN]:
                    'arn:aws:eks:eu-west-1:123456789012:cluster/cluster1',
                  [ANNOTATION_AWS_IAM_ROLE_ARN]:
                    'arn:aws:iam::123456789012:role/cluster1',
                  'kubernetes.io/auth-provider': 'aws',
                  'kubernetes.io/x-k8s-aws-id': 'cluster1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there are is a cluster and I have a value mapper', () => {
    beforeEach(() => {
      eks.on(ListClustersCommand).resolves({
        clusters: ['cluster1'],
      });
      eks.on(DescribeClusterCommand).resolves({
        cluster: {
          name: 'cluster1',
          roleArn: 'arn:aws:iam::123456789012:role/cluster1',
          arn: 'arn:aws:eks:eu-west-1:123456789012:cluster/cluster1',
          tags: {
            some_url: 'https://asdfhwef.com/hello-world',
          },
        },
      });
    });

    it('creates eks cluster with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEKSClusterProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                labels: {
                  some_url: 'https://asdfhwef.com/hello-world',
                },
                name: 'a140791d2b20a847f2c74c62c384f93fb83691d871e80385720bce696a0a05f',
                title: '123456789012:eu-west-1:cluster1',
                annotations: expect.objectContaining({
                  [ANNOTATION_AWS_EKS_CLUSTER_ARN]:
                    'arn:aws:eks:eu-west-1:123456789012:cluster/cluster1',
                  [ANNOTATION_AWS_IAM_ROLE_ARN]:
                    'arn:aws:iam::123456789012:role/cluster1',
                  'kubernetes.io/auth-provider': 'aws',
                  'kubernetes.io/x-k8s-aws-id': 'cluster1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
