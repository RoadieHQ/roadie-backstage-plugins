import { getVoidLogger } from '@backstage/backend-common';
import { PassThrough } from 'stream';
import { TemplateAction } from '@backstage/plugin-scaffolder-backend';
import { ConfigReader } from '@backstage/config';
import { createArgoCdResources } from './argocd';

const mockCreateArgoResources = jest.fn();

jest.mock('@runway/plugin-argocd-backend', () => {
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
