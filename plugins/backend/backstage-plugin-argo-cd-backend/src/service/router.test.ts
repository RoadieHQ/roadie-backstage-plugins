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
              },
            ],
          },
        ],
      },
    },
  },
]);

describe('router', () => {
  let app: Express;

  beforeEach(async () => {
    const router = await createRouter({ config, logger });
    app = express().use(router);
    fetchMock.resetMocks();
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
});
