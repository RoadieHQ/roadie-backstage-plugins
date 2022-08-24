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
import { TemplateAction } from '@backstage/plugin-scaffolder-backend';
import { ConfigReader } from '@backstage/config';
import { createArgoCdResources } from './argocd';

const mockCreateArgoResources = jest.fn();

jest.mock('@roadiehq/backstage-plugin-argo-cd-backend', () => {
  return {
    ArgoService: jest.fn().mockImplementation(() => {
      return {
        createArgoResources: mockCreateArgoResources,
      };
    }),
  };
});

describe('argocd:create-resources', () => {
  const config = ConfigReader.fromConfigs([
    {
      context: '',
      data: {
        argocd: {
          username: 'user',
          password: 'password',
          appLocatorMethods: [
            {
              type: 'config',
              instances: [
                {
                  name: 'argoInstance1',
                  url: 'https://argoInstance1.com',
                },
              ],
            },
          ],
        },
      },
    },
  ]);

  let action: TemplateAction<any>;

  const mockContext = {
    input: {
      argoInstance: 'argoInstance1',
      namespace: 'testNamespace',
      projectName: 'testProject',
      appName: 'testApp',
      repoUrl: 'https://github.com/backstage/backstage.git',
      path: 'kubernetes/nonproduction',
      labelValue: 'backstage-name=testId',
    },
    workspacePath: 'lol',
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  beforeEach(() => {
    action = createArgoCdResources(config, getVoidLogger());
  });

  it('should create argocd application', async () => {
    mockCreateArgoResources.mockResolvedValueOnce(true);
    await action.handler(mockContext);
    expect(mockCreateArgoResources).toHaveBeenCalled();
  });
});
