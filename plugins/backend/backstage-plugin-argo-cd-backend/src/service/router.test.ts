import { createRouter } from './router';
import express, { Express } from 'express';
import { ConfigReader } from '@backstage/config';
import request from 'supertest';
import { getVoidLogger } from '@backstage/backend-common';
import { ArgoService } from './argocd.service';

const logger = getVoidLogger();
const config = ConfigReader.fromConfigs([
  {
    context: '',
    data: {
      argocd: {
        waitCycles: 0,
        username: 'testusername',
        password: 'testpassword',
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
const getArgoToken = jest.fn()
const createArgoProject = jest.fn()
const createArgoApplication = jest.fn()
const deleteApp = jest.fn()
const getArgoAppData = jest.fn()
const deleteProject = jest.fn()
ArgoService.prototype.getArgoToken = getArgoToken
ArgoService.prototype.createArgoProject = createArgoProject
ArgoService.prototype.createArgoApplication = createArgoApplication
ArgoService.prototype.deleteApp = deleteApp
ArgoService.prototype.getArgoAppData = getArgoAppData
ArgoService.prototype.deleteProject = deleteProject

describe('router', () => {
  let app: Express;

  beforeEach(async () => {
    const router = await createRouter({ config, logger });
    app = express().use(router);
    jest.resetAllMocks()
    getArgoToken.mockResolvedValue('testToken')
  });

  it('returns the requested data', async () => {
    const response = await request(app).post('/createArgo').send({
      clusterName: 'argoInstance1',
      namespace: 'test-namespace',
      projectName: 'test-project',
      appName: 'test-app-nonprod',
      sourceRepo: 'test-repo',
      sourcePath: 'k8s/test',
      labelValue: 'test-app',
    });
    
    expect(getArgoToken).toBeCalledTimes(1)
    expect(createArgoProject).toBeCalledTimes(1)
    expect(createArgoApplication).toBeCalledTimes(1)
    expect(response.body).toMatchObject({
      argoAppName: 'test-app-nonprod',
      argoProjectName: 'test-project',
      kubernetesNamespace: 'test-namespace',
    });
  });
  
  describe('delete application', () => {
    it('successfully deletes the argo application and project', async () => {
      getArgoAppData.mockResolvedValue({})
      deleteApp.mockResolvedValue(true)
      deleteProject.mockResolvedValue(true)
      const response = await request(app).delete('/argoInstance/argoInstance1/applications/app')
      
      expect(response.body).toMatchObject({
        argoDeleteAppResp: true,
        argoDeleteProjectResp: true
      });
    });

    it('fails to delete the project because application was already deleted', async () => {
      getArgoAppData.mockRejectedValue(new Error('Application not found'))
      deleteApp.mockResolvedValue(true)
      
      const response = await request(app).delete('/argoInstance/argoInstance1/applications/app')
      
      expect(deleteProject).not.toBeCalled()
      expect(response.status).toBe(500)
      expect(response.body).toMatchObject({status: 'Application not found'});
    });

     it('fails to delete the project because application still exists', async () => {
      getArgoAppData.mockResolvedValue({ metadata: {} })
      deleteApp.mockResolvedValue(true)
      deleteProject.mockRejectedValue(new Error('Cannot delete project: project belongs to an existing application'))
      
      const response = await request(app).delete('/argoInstance/argoInstance1/applications/app')
      
      expect(response.status).toBe(500)
      expect(response.body).toMatchObject({ status: /Cannot delete project/i });
    });
  })
});
