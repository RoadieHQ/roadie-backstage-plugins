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
import { PassThrough } from 'stream';
import { createEcrAction } from './create';
import { mockClient } from 'aws-sdk-client-mock';
import { ECRClient } from '@aws-sdk/client-ecr';
import { mockServices } from '@backstage/backend-test-utils';

// @ts-ignore
const ecrClient = mockClient(ECRClient);
const region = 'us-east-1';

ecrClient.resolves({});

describe('create', () => {
  const mockContext = {
    task: {
      id: 'task-id',
    },
    logger: mockServices.logger.mock(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    checkpoint: jest.fn(),
    getInitiatorCredentials: jest.fn(),
    workspacePath: '/fake-tmp-dir',
  };

  describe('Create ECR repository without tags', () => {
    const repoName = 'no-tags';

    const action = createEcrAction();

    it('Should call ECR client send without tags', async () => {
      await action.handler({
        ...mockContext,
        input: {
          repoName: repoName,
          region: region,
          imageMutability: false,
          scanOnPush: false,
          tags: [],
        },
      });
      expect(ecrClient.send.getCall(0).args[0].input).toMatchObject({
        repositoryName: repoName,
        imageTagMutability: 'IMMUTABLE',
        imageScanningConfiguration: { scanOnPush: false },
        tags: [],
      });
    });
  });

  describe('Create ECR repository with tags', () => {
    const repoName = 'tags';

    const action = createEcrAction();

    it('should call ecr client with the given tags', async () => {
      await action.handler({
        ...mockContext,
        input: {
          repoName: repoName,
          imageMutability: false,
          scanOnPush: false,
          tags: [{ Key: 'keytest', Value: 'valuetest' }],
          region: region,
        },
      });
      expect(ecrClient.send.getCall(1).args[0].input).toMatchObject({
        repositoryName: repoName,
        imageTagMutability: 'IMMUTABLE',
        imageScanningConfiguration: { scanOnPush: false },
        tags: [{ Key: 'keytest', Value: 'valuetest' }],
      });
    });
  });

  describe('Create ECR repo with image mutability enabled', () => {
    const repoName = 'mutable';

    const action = createEcrAction();

    it('Should call ECR client with the mutability enabled', async () => {
      await action.handler({
        ...mockContext,
        input: {
          repoName: repoName,
          imageMutability: true,
          scanOnPush: false,
          tags: [],
          region: region,
        },
      });
      expect(ecrClient.send.getCall(2).args[0].input).toMatchObject({
        repositoryName: repoName,
        imageTagMutability: 'MUTABLE',
        imageScanningConfiguration: { scanOnPush: false },
        tags: [],
      });
    });
  });

  describe('Create ECR repo with image mutability disabled', () => {
    const repoName = 'mutable';

    const action = createEcrAction();

    it('Should call ECR client with the mutability disabled', async () => {
      await action.handler({
        ...mockContext,
        input: {
          repoName: repoName,
          imageMutability: false,
          scanOnPush: false,
          tags: [],
          region: region,
        },
      });
      expect(ecrClient.send.getCall(3).args[0].input).toMatchObject({
        repositoryName: repoName,
        imageTagMutability: 'IMMUTABLE',
        imageScanningConfiguration: { scanOnPush: false },
        tags: [],
      });
    });
  });

  describe('Create ECR repo with image scanning enabled', () => {
    const repoName = 'scan-enabled';

    const action = createEcrAction();

    it('Should call ECR client with the scanOnPush enabled', async () => {
      await action.handler({
        ...mockContext,
        input: {
          repoName: repoName,
          imageMutability: false,
          scanOnPush: true,
          tags: [],
          region: region,
        },
      });
      expect(ecrClient.send.getCall(4).args[0].input).toMatchObject({
        repositoryName: repoName,
        imageTagMutability: 'IMMUTABLE',
        imageScanningConfiguration: { scanOnPush: true },
        tags: [],
      });
    });
  });

  describe('Create ECR repo with image scanning disabled', () => {
    const repoName = 'scan-disabled';

    const action = createEcrAction();

    it('Should call ECR client with the scanOnPush disabled', async () => {
      await action.handler({
        ...mockContext,
        input: {
          repoName: repoName,
          imageMutability: false,
          scanOnPush: false,
          tags: [],
          region: region,
        },
      });
      expect(ecrClient.send.getCall(5).args[0].input).toMatchObject({
        repositoryName: repoName,
        imageTagMutability: 'IMMUTABLE',
        imageScanningConfiguration: { scanOnPush: false },
        tags: [],
      });
    });
  });

  describe('Create ECR repository with error', () => {
    const repoName = 'no-tags';

    const action = createEcrAction();

    it('Should forward ECR client errors', async () => {
      ecrClient.rejects('aws error');

      await expect(
        action.handler({
          ...mockContext,
          input: {
            repoName: repoName,
            region: region,
            imageMutability: false,
            scanOnPush: false,
            tags: [],
          },
        }),
      ).rejects.toThrow('aws error');

      expect(ecrClient.send.getCall(0).args[0].input).toMatchObject({
        repositoryName: repoName,
        imageTagMutability: 'IMMUTABLE',
        imageScanningConfiguration: { scanOnPush: false },
        tags: [],
      });
    });
  });
});
