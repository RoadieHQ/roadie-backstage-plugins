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

import { STS, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { EC2, DescribeVolumesCommand } from '@aws-sdk/client-ec2';
import { mockClient } from 'aws-sdk-client-mock';
import { createLogger, transports } from 'winston';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import {
  ANNOTATION_EBS_VOLUME_ID,
  AWSEBSVolumeProvider,
} from './AWSEBSVolumeProvider';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const ec2 = mockClient(EC2);
const sts = mockClient(STS);

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('AWSEBSVolumeProvider', () => {
  const config = new ConfigReader({
    accountId: '123456789012',
    roleName: 'arn:aws:iam::123456789012:role/role1',
    region: 'eu-west-1',
  });

  beforeEach(() => {
    sts.on(GetCallerIdentityCommand).resolves({});
  });

  describe('where there is no volumes', () => {
    beforeEach(() => {
      ec2.on(DescribeVolumesCommand).resolves({
        Volumes: [],
      });
    });

    it('creates no volumes', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEBSVolumeProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where there are is a volume', () => {
    beforeEach(() => {
      ec2.on(DescribeVolumesCommand).resolves({
        Volumes: [
          {
            VolumeId: 'volume1',
            Tags: [
              {
                Key: 'something',
                Value: 'something//something',
              },
            ],
            VolumeType: 'gp3',
            Size: 128,
            AvailabilityZone: 'eu-west-1',
            State: 'available',
            Encrypted: true,
            Attachments: [],
            CreateTime: new Date(1752592692000),
          },
        ],
      });
    });

    it('creates table', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEBSVolumeProvider.fromConfig(config, { logger });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-ebs-volume-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'ebs-volume',
              },
              metadata: expect.objectContaining({
                labels: {
                  something: 'something--something',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_EBS_VOLUME_ID]: 'volume1',
                  'backstage.io/managed-by-location':
                    'aws-ebs-volume-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-ebs-volume-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#VolumeDetails:volumeId=volume1',
                }),
              }),
            }),
          }),
        ],
      });
    });

    it('creates table with a template', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const template = readFileSync(
        join(dirname(__filename), './AWSEBSVolumeProvider.example.yaml.njs'),
      ).toString();
      const provider = AWSEBSVolumeProvider.fromConfig(config, {
        logger,
        template,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-ebs-volume-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'ebs-volume',
              },
              metadata: expect.objectContaining({
                labels: {
                  something: 'something--something',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_EBS_VOLUME_ID]: 'volume1',
                  'backstage.io/managed-by-location':
                    'aws-ebs-volume-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-ebs-volume-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#VolumeDetails:volumeId=volume1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });

  describe('where there are is a table and I have a value mapper', () => {
    beforeEach(() => {
      ec2.on(DescribeVolumesCommand).resolves({
        Volumes: [
          {
            VolumeId: 'volume1',
            Tags: [
              {
                Key: 'something',
                Value: 'something//something',
              },
            ],
            VolumeType: 'gp3',
            Size: 128,
            AvailabilityZone: 'eu-west-1',
            State: 'available',
            Encrypted: true,
            Attachments: [],
            CreateTime: new Date(1752592692000),
          },
        ],
      });
    });

    it('creates tables with the tags as is', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = AWSEBSVolumeProvider.fromConfig(config, {
        logger,
        labelValueMapper: value => value,
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [
          expect.objectContaining({
            locationKey: 'aws-ebs-volume-provider-0',
            entity: expect.objectContaining({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              spec: {
                owner: 'unknown',
                type: 'ebs-volume',
              },
              metadata: expect.objectContaining({
                labels: {
                  something: 'something//something',
                },
                annotations: expect.objectContaining({
                  [ANNOTATION_EBS_VOLUME_ID]: 'volume1',
                  'backstage.io/managed-by-location':
                    'aws-ebs-volume-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/managed-by-origin-location':
                    'aws-ebs-volume-provider-0:arn:aws:iam::123456789012:role/role1',
                  'backstage.io/view-url':
                    'https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#VolumeDetails:volumeId=volume1',
                }),
              }),
            }),
          }),
        ],
      });
    });
  });
});
