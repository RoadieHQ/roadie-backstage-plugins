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
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { AWSEKSClusterProvider } from './AWSEKSClusterProvider';
import {
  ANNOTATION_AWS_EKS_CLUSTER_ARN,
  ANNOTATION_AWS_IAM_ROLE_ARN,
} from '../annotations';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';

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
    sts.on(GetCallerIdentityCommand).resolves({
      Account: '123456789012',
    });
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
          version: '1.28',
          endpoint: 'https://EXAMPLE123.gr7.eu-west-1.eks.amazonaws.com',
          certificateAuthority: {
            data: 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCVENDQWUyZ0F3SUJBZ0lJZGFHR2dHR0dHR0d3RFFZSktvWklodmNOQVFFTEJRQXdGVEVUTUJFR0ExVUUKQXhNS2EzVmlaWEp1WlhSbGN6QWVGdzB5TkRBMU1EWXdOekV3TkRCYUZ3MHpOREExTURRd056RTFOREJhTUJVeApFekFSQmdOVkJBTVRDbXQxWW1WeWJtVjBaWE13Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLCkFvSUJBUUMrMlA3MFk0bEhxR0hHR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHS',
          },
          tags: {
            owner: 'team-platform',
            environment: 'production',
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
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
    });

    it('creates eks cluster using template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSEKSClusterProvider.example.yaml.njs'),
      ).toString();

      const provider = AWSEKSClusterProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(
        (entityProviderConnection.applyMutation as jest.Mock).mock.calls,
      ).toMatchSnapshot();
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

  describe('where there is a cluster with dynamic account config', () => {
    beforeEach(() => {
      eks.on(ListClustersCommand).resolves({
        clusters: ['cluster1'],
      });
      eks.on(DescribeClusterCommand).resolves({
        cluster: {
          name: 'cluster1',
          roleArn: 'arn:aws:iam::999888777666:role/cluster1',
          arn: 'arn:aws:eks:us-east-1:999888777666:cluster/cluster1',
          version: '1.28',
          endpoint: 'https://EXAMPLE456.gr7.us-east-1.eks.amazonaws.com',
          certificateAuthority: {
            data: 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCVENDQWUyZ0F3SUJBZ0lJZGFHR2dHR0dHR0d3RFFZSktvWklodmNOQVFFTEJRQXdGVEVUTUJFR0ExVUUKQXhNS2EzVmlaWEp1WlhSbGN6QWVGdzB5TkRBMU1EWXdOekV3TkRCYUZ3MHpOREExTURRd056RTFOREJhTUJVeApFekFSQmdOVkJBTVRDbXQxWW1WeWJtVjBaWE13Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLCkFvSUJBUUMrMlA3MFk0bEhxR0hHR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdIR0hHSEdICkdIR0hHS',
          },
          tags: {
            owner: 'team-platform',
          },
        },
      });
      sts.on(GetCallerIdentityCommand).resolves({
        Account: '999888777666',
      });
    });

    it('creates eks cluster with different region and accountId from dynamic config', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };

      const dynamicRoleArn = 'arn:aws:iam::999888777666:role/dynamic-role';
      const dynamicRegion = 'us-east-1';
      const dynamicAccountId = '999888777666';

      const provider = AWSEKSClusterProvider.fromConfig(config, {
        logger,
        useTemporaryCredentials: true,
      });

      await provider.connect(entityProviderConnection);
      await provider.run({
        roleArn: dynamicRoleArn,
        region: dynamicRegion,
      });

      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            entity: expect.objectContaining({
              metadata: expect.objectContaining({
                name: 'a140791d2b20a847f2c74c62c384f93fb83691d871e80385720bce696a0a05f',
                title: `${dynamicAccountId}:${dynamicRegion}:cluster1`,
                annotations: expect.objectContaining({
                  'backstage.io/managed-by-location': `aws-eks-cluster-0:${dynamicRoleArn}`,
                  'backstage.io/managed-by-origin-location': `aws-eks-cluster-0:${dynamicRoleArn}`,
                  'amazon.com/account-id': dynamicAccountId,
                  'kubernetes.io/api-server':
                    expect.stringContaining(dynamicRegion),
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
