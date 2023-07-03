import { createRouter } from './router';
import express, { Express } from 'express';
import { ConfigReader } from '@backstage/config';
import request from 'supertest';
import { getVoidLogger } from '@backstage/backend-common';
import fetchMock from 'jest-fetch-mock';
import { timer } from './timer.services';
import { mocked } from 'ts-jest/utils';

const mockDeleteApp = jest.fn();
const mockDeleteProject = jest.fn();
const mockGetArgoAppData = jest.fn();
const mockGetArgoToken = jest.fn();
const mockCreateArgoProject = jest.fn();
const mockCreateArgoApplication = jest.fn();
const mockDeleteAppandProject = jest.fn();
const mockGetArgoInstanceArray = jest.fn();
const mockUpdateArgoProjectAndApp = jest.fn();
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
        deleteAppandProject: mockDeleteAppandProject,
        getArgoInstanceArray: mockGetArgoInstanceArray,
        updateArgoProjectAndApp: mockUpdateArgoProjectAndApp,
      };
    }),
  };
});
jest.mock('./timer.services');

const logger = getVoidLogger();
const config = ConfigReader.fromConfigs([
  {
    context: '',
    data: {
      argocd: {
        // waitCycles: 0,
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
                token: 'token',
              },
              {
                name: 'argoInstance2',
                url: 'https://argoInstance2.com',
              },
            ],
          },
        ],
        waitCycles: 5,
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
    mockGetArgoInstanceArray.mockReturnValue([
      {
        name: 'argoInstance1',
        url: 'https://argoInstance1.com',
        token: 'token',
        username: 'username',
        password: 'password',
      },
      {
        name: 'argoInstance2',
        url: 'https://argoInstance2.com',
        token: 'token',
        username: 'username',
        password: 'password',
      },
    ]);

    const response = await request(app).post('/createArgo').send({
      clusterName: 'argoInstance1',
      namespace: 'test-namespace',
      projectName: 'test-project',
      appName: 'test-app-nonprod',
      sourceRepo: 'test-repo',
      sourcePath: 'k8s/test',
      labelValue: 'test-app',
    });

    expect(mockCreateArgoProject).toHaveBeenCalledTimes(1);
    expect(mockCreateArgoApplication).toHaveBeenCalledTimes(1);
    expect(response.body).toMatchObject({
      argoAppName: 'test-app-nonprod',
      argoProjectName: 'test-project',
      kubernetesNamespace: 'test-namespace',
    });
  });

  it('delete sends back status of app and project deletion', async () => {
    mockDeleteAppandProject.mockResolvedValue({
      argoDeleteAppResp: {
        status: 'success',
        message: 'application is deleted successfully',
      },
      argoDeleteProjectResp: {
        status: 'failed',
        message: 'error deleting project',
      },
    });

    const response = await request(app).delete(
      '/argoInstance/argoInstance1/applications/appName',
    );
    expect(response.body).toMatchObject({
      argoDeleteAppResp: {
        status: 'success',
        message: 'application is deleted successfully',
      },
      argoDeleteProjectResp: {
        status: 'failed',
        message: 'error deleting project',
      },
    });
  });

  describe('/updateArgo/:argoAppName', () => {
    let data: object;
    beforeEach(() => {
      jest.clearAllMocks();
      data = {
        clusterName: 'argoInstance1',
        namespace: 'namespace',
        projectName: 'projectName',
        appName: 'appName',
        labelValue: 'labelValue',
        sourceRepo: 'sourceRepo',
        sourcePath: 'sourcePath',
      };
      mockGetArgoInstanceArray.mockReturnValue([
        {
          name: 'argoInstance1',
          url: 'https://argoInstance1.com',
          username: 'testusername',
          password: 'testpassword',
          token: 'token',
        },
        {
          name: 'argoInstance2',
          url: 'https://argoInstance2.com',
        },
      ]);
    });
    it('gets argo token if no token in matched instance', async () => {
      await request(app)
        .put('/updateArgo/test')
        .send({ ...data, clusterName: 'argoInstance2' });

      expect(mockGetArgoToken).toHaveBeenCalledWith({
        name: 'argoInstance2',
        url: 'https://argoInstance2.com',
      });
    });

    it('sends 500 on unmatched instance', async () => {
      const res = await request(app)
        .put('/updateArgo/test')
        .send({ ...data, clusterName: 'argoInstance3' });

      expect(res.status).toBe(500);
    });

    it('calls updateArgoProjectAndApp', async () => {
      await request(app).put('/updateArgo/test').send(data);

      expect(mockUpdateArgoProjectAndApp).toHaveBeenCalledTimes(1);
      expect(mockUpdateArgoProjectAndApp).toHaveBeenCalledWith({
        instanceConfig: {
          name: 'argoInstance1',
          url: 'https://argoInstance1.com',
          username: 'testusername',
          password: 'testpassword',
          token: 'token',
        },
        argoToken: 'token',
        projectName: 'projectName',
        appName: 'appName',
        namespace: 'namespace',
        sourceRepo: 'sourceRepo',
        sourcePath: 'sourcePath',
        labelValue: 'labelValue',
      });
    });

    it('sends 500 on failed update', async () => {
      mockUpdateArgoProjectAndApp.mockRejectedValueOnce({});
      const res = await request(app).put('/updateArgo/test').send(data);
      expect(res.status).toBe(500);
    });

    it('sends 200 on update success', async () => {
      const res = await request(app).put('/updateArgo/test').send(data);
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        argoProjectName: 'projectName',
        argoAppName: 'appName',
        kubernetesNamespace: 'namespace',
      });
    });
  });
});
