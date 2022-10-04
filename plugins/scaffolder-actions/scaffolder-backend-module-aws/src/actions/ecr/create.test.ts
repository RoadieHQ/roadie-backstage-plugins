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
import { getVoidLogger } from '@backstage/backend-common';
import { PassThrough } from 'stream';
import { createEcrAction } from './create';
import { mockClient } from 'aws-sdk-client-mock';
import { ECRClient } from '@aws-sdk/client-ecr';

// @ts-ignore
const ecrClient = mockClient(ECRClient);

describe('create without tags', () => {
  const mockContext = {
    workspacePath: '/fake-tmp-dir',
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };
  const action = createEcrAction();

  it('should call ecr client send', async () => {
    await action.handler({
      ...mockContext,
      input: {
        repoName: 'test1',
        region: 'us-east-1',
        imageMutability: true,
        tags: [],
      },
    });
    expect(ecrClient.send.getCall(0).args[0].input).toMatchObject({
      repositoryName: 'test1',
      imageTagMutability: 'MUTABLE',
      tags: [],
    });
  });
});

describe('create with tags', () => {
  const mockContext = {
    workspacePath: '/fake-tmp-dir',
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };
  const action = createEcrAction();

  it('should call ecr client with the given tags', async () => {
    await action.handler({
      ...mockContext,
      input: {
        repoName: 'test2',
        imageMutability: false,
        tags: [{ Key: 'keytest', Value: 'valuetest' }],
        region: 'us-east-1',
      },
    });
    expect(ecrClient.send.getCall(1).args[0].input).toMatchObject({
      repositoryName: 'test2',
      imageTagMutability: 'IMMUTABLE',
      tags: [{ Key: 'keytest', Value: 'valuetest' }],
    });
  });
});
