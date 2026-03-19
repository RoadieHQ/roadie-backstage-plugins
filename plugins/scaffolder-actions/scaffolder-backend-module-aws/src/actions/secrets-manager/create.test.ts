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
import { createAwsSecretsManagerCreateAction as createAwsSecretsManagerCreateAction } from './create';
import { mockClient } from 'aws-sdk-client-mock';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { mockServices } from '@backstage/backend-test-utils';

// @ts-ignore
const secretsManagerClient = mockClient(SecretsManagerClient);
const region = 'us-east-1';

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
  describe('Create secret without tags', () => {
    const secretName = 'no-tags';

    const action = createAwsSecretsManagerCreateAction();

    it('Should call Secrets Manager client send', async () => {
      await action.handler({
        ...mockContext,
        input: {
          name: secretName,
          description: '',
          value: '',
          tags: [],
          profile: '',
          region: region,
        },
      });
      expect(secretsManagerClient.send.getCall(0).args[0].input).toMatchObject({
        Name: secretName,
        Tags: [],
      });
    });
  });

  describe('Create secret without optional properties', () => {
    const secretName = 'no-optional-properties';

    const action = createAwsSecretsManagerCreateAction();

    it('Should call Secrets Manager client send', async () => {
      await action.handler({
        ...mockContext,
        input: {
          name: secretName,
          description: '',
          value: '',
          tags: [],
          profile: '',
          region: region,
        },
      });
      expect(secretsManagerClient.send.getCall(1).args[0].input).toMatchObject({
        Name: secretName,
      });
    });
  });

  describe('Create secret with optional properties', () => {
    const secretName = 'optional-properties';

    const action = createAwsSecretsManagerCreateAction();

    it('Should call Secrets Manager client send', async () => {
      await action.handler({
        ...mockContext,
        input: {
          name: secretName,
          description: 'description',
          value: 'value',
          tags: [{ Key: 'keytest', Value: 'valuetest' }],
          profile: 'aws-profile',
          region: region,
        },
      });
      expect(secretsManagerClient.send.getCall(2).args[0].input).toMatchObject({
        Name: secretName,
        Description: 'description',
        SecretString: 'value',
        Tags: [{ Key: 'keytest', Value: 'valuetest' }],
      });
    });
  });
});
