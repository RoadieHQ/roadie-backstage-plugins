import { createRouter } from './router';
import express, { Express } from 'express';
import { ConfigReader } from '@backstage/config';
import request from 'supertest';
import { getVoidLogger } from '@backstage/backend-common';
import fetchMock from 'jest-fetch-mock';
import {
  argocdCreateApplicationResp,
  argocdCreateProjectResp,
} from './argocdTestResponses';
import { timer } from './timer.services';
import { mocked } from 'ts-jest/utils'

const mockDeleteApp = jest.fn();
const mockDeleteProject = jest.fn();
const mockGetArgoAppData =jest.fn();
const mockGetArgoToken = jest.fn();
const mockCreateArgoProject = jest.fn();
const mockCreateArgoApplication = jest.fn();
jest.mock('./argocd.service', () => {
  return {
    ArgoService: jest.fn().mockImplementation(() => {
      return {
        deleteApp: mockDeleteApp,
        deleteProject: mockDeleteProject, 
        getArgoAppData: mockGetArgoAppData,
        getArgoToken: mockGetArgoToken,
        createArgoProject: mockCreateArgoProject,
        createArgoApplication: mockCreateArgoApplication,
        
      };
    }),
    };
});
jest.mock('./timer.services')

const logger = getVoidLogger();
const config = ConfigReader.fromConfigs([
  {
    context: '',
    data: {
      argocd: {
        username: 'testusername',
        password: 'testpassword',
        appLocatorMethods: [
          {
            type: 'config',
            instances: [
              {
                name: 'argoInstance1',
                url: 'https://argoInstance1.com',
                username: 'testusername',
                password: 'testpassword',
                token: 'token'
              },
            ],
          },
        ],
        waitCycles: 5
      },
    },
  },
]);
describe('router', () => {
  let app: Express;
  beforeEach(async () => {
    const router = await createRouter({ config, logger });
    app = express().use(router);
    mocked(timer).mockResolvedValue(0);
    fetchMock.resetMocks();
    mockDeleteProject.mockReset();
    mockDeleteApp.mockReset();
    mockGetArgoAppData.mockReset();
  });
  it('returns the requested data', async () => {
    fetchMock.mockOnceIf(
      /.*\/api\/v1\/session/g,
      JSON.stringify({ token: 'testToken' }),
    );
    fetchMock.mockResponseOnce(
      JSON.stringify({
        argocdCreateProjectResp,
      }),
    );
    fetchMock.mockResponseOnce(
      JSON.stringify({
        argocdCreateApplicationResp,
      }),
    );
    const response = await request(app).post('/createArgo').send({
      clusterName: 'argoInstance1',
      namespace: 'test-namespace',
      projectName: 'test-project',
      appName: 'test-app-nonprod',
      sourceRepo: 'test-repo',
      sourcePath: 'k8s/test',
      labelValue: 'test-app',
    });
    expect(response.body).toMatchObject({
      argoAppName: 'test-app-nonprod',
      argoProjectName: 'test-project',
      kubernetesNamespace: 'test-namespace',
    });
  });
  it('delete fails when argo instance is not found', async () => {
    fetchMock.mockOnceIf(
      /.*\/api\/v1\/session/g,
      JSON.stringify({ token: 'testToken' }),
    );
    const response = await request(app).delete('/argoInstance/:argoInstanceName/applications/argoInstance2');
    expect(response.body).toMatchObject({
      status: 'failed',
      message: 'cannot find an argo instance to match this cluster',
    });
  });
  it('when deleteApp returns 404 Not found continue to delete Project', async () => {
    mockDeleteApp.mockRejectedValueOnce(new Error('Not Found'));
    mockDeleteProject.mockResolvedValueOnce(true);
    const response = await request(app).delete('/argoInstance/argoInstance1/applications/appName');
    expect(response.body).toMatchObject({
      argoDeleteAppResp:  {
        status: 'failed',
        message: 'Not Found'
      },
      argoDeleteProjectResp: {
        status: 'success',
        message: 'project is deleted successfully'
      },
    });
  });
  it('when deleteApp gives 5xx errors skip project deletion', async () => {
    mockDeleteApp.mockResolvedValueOnce(false);
    mockDeleteProject.mockResolvedValueOnce(true);
    const response = await request(app).delete('/argoInstance/argoInstance1/applications/appName');
    expect(response.body).toMatchObject({
      argoDeleteAppResp:  {
        status: 'failed',
        message: 'error with deleteing argo app'
      },
      argoDeleteProjectResp: {
        status: 'failed',
        message: 'skipping project deletion due to erro deleting argo app'
      },
    });
  });
  it('when app is in pending to delete state skip project deletion', async () => {
    mockDeleteApp.mockResolvedValueOnce(true);
    mockGetArgoAppData.mockResolvedValue({
      metadata: {
        instance: {
          name: 'argoInstance1'
        }
      }
    })
    const response = await request(app).delete('/argoInstance/argoInstance1/applications/appName');
    expect(response.body).toMatchObject({
      argoDeleteAppResp:  {
        status: 'failed',
        message: 'application pending delete'
      },
      argoDeleteProjectResp: {
        status: 'failed',
        message: 'skipping project deletion due to app deletion pending'
      },
    });
  });
  it('when getArgoCD returns 404 every time and app is in pending to delete state skip project deletion', async () => {
    mockDeleteApp.mockResolvedValueOnce(true);
    mockGetArgoAppData.mockResolvedValueOnce({
      metadata: {
        instance: {
          name: 'argoInstance1'
        }
      }
    })
    mockGetArgoAppData.mockRejectedValue(new Error('Could not retrieve ArgoCD app data.'))
    const response = await request(app).delete('/argoInstance/argoInstance1/applications/appName');
    expect(response.body).toMatchObject({
      argoDeleteAppResp:  {
        status: 'failed',
        message: 'application pending delete'
      },
      argoDeleteProjectResp: {
        status: 'failed',
        message: 'skipping project deletion due to app deletion pending'
      },
    });
  });
  it('when getArgoCD returns 404 one occurrence and the app is later deleted then delete project', async () => {
    mockDeleteApp.mockResolvedValueOnce(true);
    mockGetArgoAppData.mockResolvedValueOnce({
      metadata: {
        instance: {
          name: 'argoInstance1'
        }
      }
    })
    mockGetArgoAppData.mockRejectedValueOnce(new Error('Could not retrieve ArgoCD app data.'))
    mockGetArgoAppData.mockResolvedValueOnce({})
    const response = await request(app).delete('/argoInstance/argoInstance1/applications/appName');
    expect(response.body).toMatchObject({
      argoDeleteAppResp:  {
        status: 'success',
        message: 'application is deleted successfully'
      },
      argoDeleteProjectResp: {
        status: 'success',
        message: 'project is deleted successfully'
      },
    });
  });
  it('successfully deletes app and successfuly deletes project', async () => {
    mockDeleteApp.mockResolvedValueOnce(true);
    mockGetArgoAppData.mockResolvedValueOnce({
      metadata: {
        instance: {
          name: 'argoInstance1'
        }
      }
    })
    mockGetArgoAppData.mockResolvedValueOnce({})
    mockDeleteProject.mockResolvedValueOnce(true);
    const response = await request(app).delete('/argoInstance/argoInstance1/applications/appName');
    expect(response.body).toMatchObject({
      argoDeleteAppResp:  {
        status: 'success',
        message: 'application is deleted successfully'
      },
      argoDeleteProjectResp: {
        status: 'success',
        message: 'project is deleted successfully'
      },
    });
  });
  it('succesfully deletes app and fails to delete project', async () => {
    mockDeleteApp.mockResolvedValueOnce(true);
    mockGetArgoAppData.mockResolvedValueOnce({
      metadata: {
        instance: {
          name: 'argoInstance1'
        }
      }
    })
    mockGetArgoAppData.mockResolvedValueOnce({})
    mockDeleteProject.mockRejectedValueOnce({ message: 'error deleting project'});
    const response = await request(app).delete('/argoInstance/argoInstance1/applications/appName');
    expect(response.body).toMatchObject({
      argoDeleteAppResp:  {
        status: 'success',
        message: 'application is deleted successfully'
      },
      argoDeleteProjectResp: {
        status: 'failed',
        message: 'error deleting project'
      },
    });
  });
});