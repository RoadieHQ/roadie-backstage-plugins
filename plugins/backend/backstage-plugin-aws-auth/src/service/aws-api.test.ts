/*
 * Copyright 2022 Larder Software Limited
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

import * as winston from 'winston';
import { getAwsApiGenerateTempCredentialsForwarder } from './aws-api';

const generateTemporaryCredentials = require('./generateTemporaryCredentials.ts');

const credentialsStub = 'CREDENTIALS_STUB';
const keyIdStub = 'TEST_KEY_ID';
const keySecretStub = 'TEST_KEY_SECRET';
const roleArnStub = 'arn:aws:iam::123456789012:role/TEST_ROLE';

const generateTemporaryCredentialsMock = jest.fn(
  (_: string, _2: string, _3: string) => ({
    Credentials: credentialsStub,
  }),
);

jest.mock('./generateTemporaryCredentials.ts', () => ({
  generateTemporaryCredentials: jest.fn(),
}));

generateTemporaryCredentials.generateTemporaryCredentials =
  generateTemporaryCredentialsMock;

const mockLogger = winston.createLogger();

describe('aws-api', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should respond with auth creds in json', async () => {
    const awsApiGenerateTempCredentialsForwarder =
      getAwsApiGenerateTempCredentialsForwarder({
        AWS_ACCESS_KEY_ID: keyIdStub,
        AWS_ACCESS_KEY_SECRET: keySecretStub,
        logger: mockLogger,
      });

    const mockResponse = () => {
      const res = { json: jest.fn };
      res.json = jest.fn().mockReturnValue(res);
      return res as any;
    };

    const response = awsApiGenerateTempCredentialsForwarder(
      {} as any,
      mockResponse(),
    );

    expect((await response).json).toBeCalledWith(credentialsStub);
    expect(generateTemporaryCredentialsMock).toBeCalledWith(
      keyIdStub,
      keySecretStub,
      undefined,
    );
  });

  it('should respond with auth creds in json with roleArn', async () => {
    const awsApiGenerateTempCredentialsForwarder =
      getAwsApiGenerateTempCredentialsForwarder({
        AWS_ACCESS_KEY_ID: keyIdStub,
        AWS_ACCESS_KEY_SECRET: keySecretStub,
        logger: mockLogger,
      });

    const mockResponse = () => {
      const res = { json: jest.fn };
      res.json = jest.fn().mockReturnValue(res);
      return res as any;
    };

    const response = awsApiGenerateTempCredentialsForwarder(
      { body: { RoleArn: roleArnStub } } as any,
      mockResponse(),
    );

    expect((await response).json).toBeCalledWith(credentialsStub);
    expect(generateTemporaryCredentialsMock).toBeCalledWith(
      keyIdStub,
      keySecretStub,
      roleArnStub,
    );
  });
});
