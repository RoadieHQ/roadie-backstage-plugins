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
import { createAwsS3CpAction } from './cp';
import mockFs from 'mock-fs';
import { mockServices } from '@backstage/backend-test-utils';

const mockS3Client = {
  send: jest.fn().mockReturnThis(),
};
const createReadStreamMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  return {
    ...jest.requireActual('@aws-sdk/client-s3'),
    S3Client: jest.fn(() => mockS3Client),
  };
});
jest.mock('fs-extra', () => {
  return {
    ...jest.requireActual('fs-extra'),
    createReadStream: jest.fn(() => createReadStreamMock),
  };
});

describe('roadiehq:aws:s3:cp', () => {
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
  const action = createAwsS3CpAction();
  beforeEach(() => {
    mockFs({
      '/fake-tmp-dir': {
        'fake-file.txt': 'awesome foo bar upload content',
      },
    });
    jest.clearAllMocks();
  });
  afterEach(() => {
    mockFs.restore();
  });

  it('should call s3client send', async () => {
    await action.handler({
      ...mockContext,
      input: { bucket: 'test', region: 'eu1' },
    });

    expect(mockS3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: 'test',
          Key: 'fake-file.txt',
          Body: createReadStreamMock,
        },
      }),
    );
  });

  it('should call s3 upload with the given prefix', async () => {
    await action.handler({
      ...mockContext,
      input: { bucket: 'test', region: 'eu1', prefix: 'upload-to-this' },
    });

    expect(mockS3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: 'test',
          Key: 'upload-to-this/fake-file.txt',
          Body: createReadStreamMock,
        },
      }),
    );
  });
  it('should call s3 upload with the given path in the workspace', async () => {
    mockFs({
      '/fake-tmp-dir': {
        'fake-file.txt': 'awesome foo bar upload content',
        'upload-this-only': {
          '1.json': '[]',
          '2.json': '{}',
        },
      },
    });

    await action.handler({
      ...mockContext,
      input: { bucket: 'test', region: 'eu1', path: 'upload-this-only' },
    });

    expect(mockS3Client.send.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        input: {
          Bucket: 'test',
          Key: 'upload-this-only/1.json',
          Body: createReadStreamMock,
        },
      }),
    );
    expect(mockS3Client.send.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        input: {
          Bucket: 'test',
          Key: 'upload-this-only/2.json',
          Body: createReadStreamMock,
        },
      }),
    );
  });

  it('should call s3 upload with all files in the workspace', async () => {
    mockFs({
      '/fake-tmp-dir': {
        'fake-file.txt': 'awesome foo bar upload content',
        'upload-this': {
          '1.json': '[]',
          '2.json': '{}',
        },
      },
    });

    await action.handler({
      ...mockContext,
      input: { bucket: 'test', region: 'eu1' },
    });

    expect(mockS3Client.send.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        input: {
          Bucket: 'test',
          Key: 'fake-file.txt',
          Body: createReadStreamMock,
        },
      }),
    );
    expect(mockS3Client.send.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        input: {
          Bucket: 'test',
          Key: 'upload-this/1.json',
          Body: createReadStreamMock,
        },
      }),
    );
    expect(mockS3Client.send.mock.calls[2][0]).toEqual(
      expect.objectContaining({
        input: {
          Bucket: 'test',
          Key: 'upload-this/2.json',
          Body: createReadStreamMock,
        },
      }),
    );
  });
});
