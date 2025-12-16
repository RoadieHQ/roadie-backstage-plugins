import { mockServices } from '@backstage/backend-test-utils';
import { Config, ConfigReader } from '@backstage/config';
import fetchMock from 'jest-fetch-mock';
import { mocked } from 'jest-mock';
import { ArgoService } from './argocd.service';
import {
  argocdCreateApplicationResp,
  argocdCreateProjectResp,
} from './argocdTestResponses';
import { timer } from './timer.services';
import {
  OIDCConfig,
  ResourceItem,
  UpdateArgoProjectAndAppProps,
} from './types';

fetchMock.enableMocks();
jest.mock('./timer.services', () => ({
  timer: jest.fn(),
}));

type GetConfigOptions = {
  clusterResourceBlacklist?: ResourceItem[];
  clusterResourceWhitelist?: ResourceItem[];
  namespaceResourceBlacklist?: ResourceItem[];
  namespaceResourceWhitelist?: ResourceItem[];
  waitCycles?: number;
  waitInterval?: number;
  otherRootConfigs?: Record<string, any>;
  oidcConfig?: OIDCConfig;
  instanceCredentials?: {
    token?: string;
    username?: string;
    password?: string;
  };
};

const getConfig = (options: GetConfigOptions): Config => {
  const {
    clusterResourceBlacklist,
    clusterResourceWhitelist,
    namespaceResourceBlacklist,
    namespaceResourceWhitelist,
    waitCycles,
    waitInterval,
    instanceCredentials,
    otherRootConfigs,
    oidcConfig,
  } = options;
  const configObject = {
    context: '',
    data: {
      ...(otherRootConfigs ? otherRootConfigs : {}),
      argocd: {
        ...(oidcConfig ? { oidcConfig } : {}),
        projectSettings: {
          ...(clusterResourceBlacklist && { clusterResourceBlacklist }),
          ...(clusterResourceWhitelist && { clusterResourceWhitelist }),
          ...(namespaceResourceBlacklist && { namespaceResourceBlacklist }),
          ...(namespaceResourceWhitelist && { namespaceResourceWhitelist }),
        },
        appLocatorMethods: [
          {
            type: 'config',
            instances: [
              {
                name: 'argoinstance1',
                url: 'https://argoinstance1.com',
                ...instanceCredentials,
              },
            ],
          },
        ],
        waitCycles,
        waitInterval,
      },
    },
  };
  return ConfigReader.fromConfigs([configObject]);
};

describe('ArgoCD service', () => {
  const logger = mockServices.logger.mock();
  const createService = (config: GetConfigOptions) =>
    ArgoService.fromConfig({
      config: getConfig(config),
      logger,
    });

  const argoService = createService({
    instanceCredentials: { token: 'token' },
  });

  const argoServiceForNoToken = createService({
    instanceCredentials: { username: 'user', password: 'pass' },
  });

  beforeEach(() => {
    mocked(timer).mockResolvedValue(0);
    jest.clearAllMocks();
    jest.restoreAllMocks();
    fetchMock.resetMocks();
  });

  describe('getRevisionData', () => {
    it.each(['https://argoinstance1.com', 'https://argoinstance1.com/'])(
      'should get revision data and handle trailing slashes in urls',
      async url => {
        const expectedResp = {
          author: 'testuser',
          date: '2023-03-20T18:44:10Z',
          message: 'Update README.md',
        };

        fetchMock.mockResponseOnce(JSON.stringify(expectedResp));

        const name = 'testApp';
        const token = 'testToken';
        const revisionId = '15db63ac922a920f388bd841912838ae4d126317';

        const resp = await argoService.getRevisionData(
          url,
          { name },
          token,
          revisionId,
        );

        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringMatching(
            `https://argoinstance1.com/api/v1/applications/${name}/revisions/${revisionId}/metadata`,
          ),
          expect.objectContaining({
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }),
        );

        expect(resp).toStrictEqual(expectedResp);
      },
    );

    it('should fail to get revision data', async () => {
      fetchMock.mockRejectOnce(new Error());

      await expect(
        argoService.getRevisionData(
          'https://argoinstance1.com',
          { name: 'testApp' },
          'testToken',
          '15db63ac922a920f388bd841912838ae4d126317',
        ),
      ).rejects.toThrow();
    });

    it('should preserve base URL path when base URL has a path prefix', async () => {
      const expectedResp = {
        author: 'testuser',
        date: '2023-03-20T18:44:10Z',
        message: 'Update README.md',
      };

      fetchMock.mockResponseOnce(JSON.stringify(expectedResp));

      const name = 'testApp';
      const token = 'testToken';
      const revisionId = '15db63ac922a920f388bd841912838ae4d126317';
      const baseUrlWithPath = 'https://argo.example.com/prefix';

      const resp = await argoService.getRevisionData(
        baseUrlWithPath,
        { name },
        token,
        revisionId,
      );

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(
          `https://argo.example.com/prefix/api/v1/applications/${name}/revisions/${revisionId}/metadata`,
        ),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(resp).toStrictEqual(expectedResp);
    });
  });

  describe('getArgoAppData', () => {
    it('should get all argo app data if no option is provided', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
            },
            {
              metadata: {
                name: 'testAppName2',
                namespace: 'testNamespace2',
              },
            },
          ],
        }),
      );
      const resp = await argoService.getArgoAppData(
        'https://argoinstance1.com',
        'argoinstance1',
        'testToken',
      );

      expect(resp).toStrictEqual({
        items: [
          {
            metadata: {
              name: 'testAppName',
              namespace: 'testNamespace',
              instance: {
                name: 'argoinstance1',
              },
            },
          },
          {
            metadata: {
              name: 'testAppName2',
              namespace: 'testNamespace2',
              instance: {
                name: 'argoinstance1',
              },
            },
          },
        ],
      });
    });

    it('should get argo app data', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          metadata: {
            name: 'testAppName',
            namespace: 'testNamespace',
          },
        }),
      );

      const resp = await argoService.getArgoAppData(
        'https://argoinstance1.com',
        'argoinstance1',
        'testToken',
        { name: 'testApp' },
      );

      expect(resp).toStrictEqual({
        instance: 'argoinstance1',
        metadata: {
          name: 'testAppName',
          namespace: 'testNamespace',
        },
      });
    });

    it('should fail to get argo app data', async () => {
      fetchMock.mockRejectOnce(new Error());

      await expect(
        argoService.getArgoAppData(
          'https://argoinstance1.com',
          'argoinstance1',
          'testToken',
          { name: 'testApp' },
        ),
      ).rejects.toThrow();
    });

    it('should preserve base URL path when base URL has a path prefix', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
            },
          ],
        }),
      );
      const baseUrlWithPath = 'https://argo.example.com/prefix';
      const resp = await argoService.getArgoAppData(
        baseUrlWithPath,
        'argoinstance1',
        'testToken',
      );

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(
          'https://argo.example.com/prefix/api/v1/applications',
        ),
        expect.any(Object),
      );

      expect(resp).toStrictEqual({
        items: [
          {
            metadata: {
              name: 'testAppName',
              namespace: 'testNamespace',
              instance: {
                name: 'argoinstance1',
              },
            },
          },
        ],
      });
    });

    it('should successfully decorate the items when using the app selector', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testApp-prod',
                namespace: 'argocd',
              },
            },
            {
              metadata: {
                name: 'testApp-staging',
                namespace: 'argocd',
              },
            },
          ],
        }),
      );

      const resp = await argoService.getArgoAppData(
        'https://argoinstance1.com',
        'argoinstance1',
        'testToken',
        { selector: 'service=testApp' },
      );

      expect(resp).toStrictEqual({
        items: [
          {
            metadata: {
              instance: {
                name: 'argoinstance1',
              },
              name: 'testApp-prod',
              namespace: 'argocd',
            },
          },
          {
            metadata: {
              instance: {
                name: 'argoinstance1',
              },
              name: 'testApp-staging',
              namespace: 'argocd',
            },
          },
        ],
      });
    });
  });

  describe('createArgoProject', () => {
    it('should create a project in argo', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          argocdCreateProjectResp,
        }),
      );

      const resp = await argoService.createArgoProject({
        baseUrl: 'https://argoinstance1.com',
        argoToken: 'testToken',
        projectName: 'testProject',
        namespace: 'test-namespace',
        sourceRepo: 'https://github.com/backstage/backstage',
      });

      expect(resp).toStrictEqual({
        argocdCreateProjectResp,
      });
    });

    it('should fail to create a project in argo when argo errors out', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          error: 'Failed to Create project',
        }),
      );

      const resp = await argoService.createArgoProject({
        baseUrl: 'https://argoinstance1.com',
        argoToken: 'testToken',
        projectName: 'testProject',
        namespace: 'test-namespace',
        sourceRepo: 'https://github.com/backstage/backstage',
      });

      expect(resp).toStrictEqual({
        error: 'Failed to Create project',
      });
    });

    it('should fail to create a project in argo when argo user is not given enough permissions', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          response: {
            status: 403,
            error:
              'permission denied: projects, create, backstagetestmanual2, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
            message:
              'permission denied: projects, create, backstagetestmanual2, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
          },
        }),
      );

      const resp = await argoService.createArgoProject({
        baseUrl: 'https://argoinstance1.com',
        argoToken: 'testToken',
        projectName: 'testProject',
        namespace: 'test-namespace',
        sourceRepo: 'https://github.com/backstage/backstage',
      });

      expect(resp).toStrictEqual({
        response: {
          error:
            'permission denied: projects, create, backstagetestmanual2, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
          message:
            'permission denied: projects, create, backstagetestmanual2, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
          status: 403,
        },
      });
    });

    it('creates project with resources-finalizer.argocd.argoproj.io finalizer', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          argocdCreateProjectResp,
        }),
      );
      const service = createService({
        instanceCredentials: { token: 'token' },
      });

      await service.createArgoProject({
        baseUrl: 'http://baseurl.com',
        argoToken: 'token',
        projectName: 'projectName',
        namespace: 'namespace',
        sourceRepo: 'sourceRepo',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('http://baseurl.com'),
        expect.objectContaining({
          body: expect.stringContaining(
            '{"metadata":{"name":"projectName","finalizers":["resources-finalizer.argocd.argoproj.io"]}',
          ),
        }),
      );
    });

    it('should preserve base URL path when creating project', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          argocdCreateProjectResp,
        }),
      );

      const baseUrlWithPath = 'https://argo.example.com/prefix';
      const resp = await argoService.createArgoProject({
        baseUrl: baseUrlWithPath,
        argoToken: 'testToken',
        projectName: 'testProject',
        namespace: 'test-namespace',
        sourceRepo: 'https://github.com/backstage/backstage',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(
          'https://argo.example.com/prefix/api/v1/projects',
        ),
        expect.any(Object),
      );

      expect(resp).toStrictEqual({
        argocdCreateProjectResp,
      });
    });
  });

  describe('createArgoApplication', () => {
    it('should create an app in argo', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          argocdCreateApplicationResp,
        }),
      );

      const resp = await argoService.createArgoApplication({
        baseUrl: 'https://argoinstance1.com',
        argoToken: 'testToken',
        appName: 'testProject',
        projectName: 'testProject',
        namespace: 'test-namespace',
        sourceRepo: 'https://github.com/backstage/backstage',
        sourcePath: 'kubernetes/nonproduction',
        labelValue: 'backstageId',
      });

      expect(resp).toStrictEqual({
        argocdCreateApplicationResp,
      });
    });

    it('should fail to create an app in argo when argo errors out', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          message: 'errorMessage',
        }),
        { status: 500 },
      );

      await expect(
        argoService.createArgoApplication({
          baseUrl: 'https://argoinstance1.com',
          argoToken: 'testToken',
          appName: 'testProject',
          projectName: 'testProject',
          namespace: 'test-namespace',
          sourceRepo: 'https://github.com/backstage/backstage',
          sourcePath: 'kubernetes/nonproduction',
          labelValue: 'backstageId',
        }),
      ).rejects.toThrow('Error creating argo app: errorMessage');
    });

    it('should fail to create a application in argo when argo user is not given enough permissions', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          response: {
            status: 403,
            error:
              'permission denied: applications, create, backstagetestmanual2/backstagetestmanual2, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
            message:
              'permission denied: applications, create, backstagetestmanual2/backstagetestmanual2, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
          },
        }),
      );

      const resp = await argoService.createArgoApplication({
        baseUrl: 'https://argoinstance1.com',
        argoToken: 'testToken',
        appName: 'testProject',
        projectName: 'testProject',
        namespace: 'test-namespace',
        sourceRepo: 'https://github.com/backstage/backstage',
        sourcePath: 'kubernetes/nonproduction',
        labelValue: 'backstageId',
      });

      expect(resp).toStrictEqual({
        response: {
          status: 403,
          error:
            'permission denied: applications, create, backstagetestmanual2/backstagetestmanual2, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
          message:
            'permission denied: applications, create, backstagetestmanual2/backstagetestmanual2, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
        },
      });
    });
  });

  describe('createArgoResources', () => {
    it('should create both app and project in argo', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          argocdCreateApplicationResp,
        }),
      );
      fetchMock.mockResponseOnce(
        JSON.stringify({
          argocdCreateApplicationResp,
        }),
      );

      const resp = await argoService.createArgoResources({
        argoInstance: 'argoinstance1',
        appName: 'testApp',
        projectName: 'testProject',
        namespace: 'testNamespace',
        sourceRepo: 'https://github.com/backstage/backstage',
        sourcePath: 'kubernetes/nonproduction',
        labelValue: 'backstageId',
        logger,
      });

      expect(resp).toStrictEqual(true);
    });

    it('should fail to create both app and project in argo when argo rejects', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          error: 'Failure to create project',
        }),
        {
          status: 500,
        },
      );

      const resp = argoService.createArgoResources({
        argoInstance: 'argoinstance1',
        appName: 'testApp',
        projectName: 'testProject',
        namespace: 'testNamespace',
        sourceRepo: 'https://github.com/backstage/backstage',
        sourcePath: 'kubernetes/nonproduction',
        labelValue: 'backstageId',
        logger,
      });

      await expect(resp).rejects.toThrow();
    });
  });

  describe('deleteProject', () => {
    it('deletes project in argo successfully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}));

      const resp = await argoService.deleteProject({
        baseUrl: 'https://argoinstance1.com',
        argoProjectName: 'testApp',
        argoToken: 'testToken',
      });

      expect(resp).toStrictEqual({ statusCode: 200 });
    });

    it('should delete project with json content type header', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}));
      await argoService.deleteProject({
        baseUrl: 'https://argoinstance1.com',
        argoProjectName: 'testApp',
        argoToken: 'testToken',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('fails to delete project in argo because of some arbitrary error', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ message: 'some error', error: 'some error', code: 1 }),
        { status: 1 },
      );

      const resp = await argoService.deleteProject({
        baseUrl: 'https://argoinstance1.com',
        argoProjectName: 'testApp',
        argoToken: 'testToken',
      });

      expect(resp).toEqual(
        expect.objectContaining({ statusCode: 1, message: 'some error' }),
      );
    });

    it('throws and logs when deleting the argo project responds with something unexpected', async () => {
      fetchMock.mockResponseOnce('', {
        status: 1,
        statusText: 'more detailed error',
      });

      await expect(
        argoService.deleteProject({
          baseUrl: 'https://argoinstance1.com',
          argoProjectName: 'testApp',
          argoToken: 'testToken',
        }),
      ).rejects.toThrow(/invalid json/i);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringMatching(/more detailed error/i),
      );
    });
  });

  describe('deleteApp', () => {
    it('should delete app in argo', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}));

      const resp = await argoService.deleteApp({
        baseUrl: 'https://argoinstance1.com',
        argoApplicationName: 'testApp',
        argoToken: 'testToken',
      });

      expect(resp).toStrictEqual({ statusCode: 200 });
    });

    it('should delete app with json content type header', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}));
      await argoService.deleteApp({
        baseUrl: 'https://argoinstance1.com',
        argoApplicationName: 'testApp',
        argoToken: 'testToken',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should fail to delete app in argo when bad response type', async () => {
      fetchMock.mockResponseOnce('', {
        status: 1,
        statusText: 'more detailed error',
      });

      await expect(
        argoService.deleteApp({
          baseUrl: 'https://argoinstance1.com',
          argoApplicationName: 'testApp',
          argoToken: 'testToken',
        }),
      ).rejects.toThrow(/invalid json/i);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringMatching(/more detailed error/i),
      );
    });

    it('should fail to delete application in argo because of some arbitrary error', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          error: 'some error',
          message: 'some error',
        }),
        { status: 1 },
      );

      const resp = await argoService.deleteApp({
        baseUrl: 'https://argoinstance1.com',
        argoApplicationName: 'testApp',
        argoToken: 'testToken',
      });

      expect(resp).toStrictEqual(
        expect.objectContaining({
          error: 'some error',
          message: 'some error',
          statusCode: 1,
        }),
      );
    });
  });

  describe('syncArgoApp', () => {
    it('should sync app', async () => {
      fetchMock.mockResponseOnce('');

      const resp = await argoService.syncArgoApp({
        argoInstance: {
          name: 'testApp',
          url: 'https://argoinstance1.com',
          appName: ['testApp'],
        },
        argoToken: 'testToken',
        appName: 'testApp',
      });

      expect(resp).toStrictEqual({
        message: 'Re-synced testApp on testApp',
        status: 'Success',
      });
    });

    it('should fail to sync app on bad status', async () => {
      fetchMock.mockResponseOnce('', { status: 500 });

      const resp = await argoService.syncArgoApp({
        argoInstance: {
          name: 'testApp',
          url: 'https://argoinstance1.com',
          appName: ['testApp'],
        },
        argoToken: 'testToken',
        appName: 'testApp',
      });

      expect(resp).toStrictEqual({
        message: 'Failed to resync testApp on testApp',
        status: 'Failure',
      });
    });

    it('should fail to sync app on bad permissions', async () => {
      fetchMock.mockResponseOnce('', { status: 403 });

      const resp = await argoService.syncArgoApp({
        argoInstance: {
          name: 'testApp',
          url: 'https://argoinstance1.com',
          appName: ['testApp'],
        },
        argoToken: 'testToken',
        appName: 'testApp',
      });

      expect(resp).toStrictEqual({
        message: 'Failed to resync testApp on testApp',
        status: 'Failure',
      });
    });

    it('should preserve base URL path when syncing app', async () => {
      fetchMock.mockResponseOnce('');

      const resp = await argoService.syncArgoApp({
        argoInstance: {
          name: 'testApp',
          url: 'https://argo.example.com/prefix',
          appName: ['testApp'],
        },
        argoToken: 'testToken',
        appName: 'testApp',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(
          'https://argo.example.com/prefix/api/v1/applications/testApp/sync',
        ),
        expect.any(Object),
      );

      expect(resp).toStrictEqual({
        message: 'Re-synced testApp on testApp',
        status: 'Success',
      });
    });

    it('should fail to sync all apps when bad permissions', async () => {
      fetchMock.mockResponseOnce('', { status: 403 });

      const resp = await argoService.syncArgoApp({
        argoInstance: {
          name: 'testApp',
          url: 'https://argoinstance1.com',
          appName: ['testApp'],
        },
        argoToken: 'testToken',
        appName: 'testApp',
      });

      expect(resp).toStrictEqual({
        message: 'Failed to resync testApp on testApp',
        status: 'Failure',
      });
    });
  });

  describe('resyncAppOnAllArgos', () => {
    it('should fail to sync app on selector and name null', async () => {
      const appSelector = '';
      await expect(
        argoService.resyncAppOnAllArgos({ appSelector }),
      ).rejects.toThrow();
    });

    it('should sync all apps', async () => {
      // findArgoApp
      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
            },
          ],
        }),
      );
      // token
      fetchMock.mockResponseOnce(
        JSON.stringify({
          token: 'testToken',
        }),
      );
      // sync
      fetchMock.mockResponseOnce('');

      const resp = await argoService.resyncAppOnAllArgos({
        appSelector: 'testApp',
      });

      expect(resp).toStrictEqual([
        [
          {
            message: 'Re-synced testAppName on argoinstance1',
            status: 'Success',
          },
        ],
      ]);
    });

    it('should return empty array when bad token', async () => {
      // token
      fetchMock.mockOnceIf(
        /.*\/api\/v1\/session/g,
        JSON.stringify({
          message: 'Unauthorized',
        }),
        { status: 401, statusText: 'Unauthorized' },
      );

      const resp = await argoServiceForNoToken.resyncAppOnAllArgos({
        appSelector: 'testApp',
      });

      expect(resp).toStrictEqual([]);
    });

    it('should fail to sync all apps due to permissions', async () => {
      // findArgoApp
      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
            },
          ],
        }),
      );
      // sync
      fetchMock.mockResponseOnce(
        JSON.stringify({
          error:
            'permission denied: applications, sync, backstagetestmanual-nonprod/backstagetestmanual-nonprod, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
          message:
            'permission denied: applications, sync, backstagetestmanual-nonprod/backstagetestmanual-nonprod, sub: testuser18471, iat: 2022-04-13T12:28:34Z',
        }),
        { status: 403 },
      );

      const resp = await argoService.resyncAppOnAllArgos({
        appSelector: 'testApp',
      });

      expect(resp).toStrictEqual([
        [
          {
            message: 'Failed to resync testAppName on argoinstance1',
            status: 'Failure',
          },
        ],
      ]);
    });

    it('should sync all apps with terminateOperation flag on', async () => {
      // findArgoApp
      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
            },
          ],
        }),
      );
      // token
      fetchMock.mockResponseOnce(
        JSON.stringify({
          token: 'testToken',
        }),
      );
      // terminateOperation
      fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });
      // sync
      fetchMock.mockResponseOnce('{}');
      const resp = await argoService.resyncAppOnAllArgos({
        appSelector: 'testApp',
        terminateOperation: true,
      });

      expect(resp).toStrictEqual([
        [
          {
            message: 'Re-synced testAppName on argoinstance1',
            status: 'Success',
          },
        ],
      ]);
    });

    it('should fail to sync all apps when terminateOperation fails', async () => {
      // findArgoApp
      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
            },
          ],
        }),
      );
      // terminateOperation
      fetchMock.mockResponseOnce(JSON.stringify({ status: 400 }));
      // sync
      fetchMock.mockResponseOnce(JSON.stringify({}), { status: 400 });

      const resp = await argoService.resyncAppOnAllArgos({
        appSelector: 'testApp',
        terminateOperation: true,
      });

      expect(resp).toStrictEqual([
        [
          {
            message: 'Failed to resync testAppName on argoinstance1',
            status: 'Failure',
          },
        ],
      ]);
    });

    it('should not sync all apps when terminateOperation errors', async () => {
      // findArgoApp
      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
            },
          ],
        }),
      );
      // token
      fetchMock.mockResponseOnce(
        JSON.stringify({
          token: 'testToken',
        }),
      );
      // terminateOperation
      fetchMock.mockRejectOnce(new Error('Failed on terminateOperation step'));

      const resp = await argoService.resyncAppOnAllArgos({
        appSelector: 'testApp',
        terminateOperation: true,
      });

      expect(resp).toStrictEqual([
        [
          {
            message: 'Failed on terminateOperation step',
            status: 'Failure',
          },
        ],
      ]);
    });

    it('should correctly match instance configs when syncing with selector', async () => {
      const service = createService({
        instanceCredentials: { token: 'token' },
      });

      fetchMock.mockResponseOnce(
        JSON.stringify({
          items: [
            {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
            },
          ],
        }),
      );

      fetchMock.mockResponseOnce('');

      const resp = await service.resyncAppOnAllArgos({
        appSelector: 'testApp',
      });

      expect(resp).toStrictEqual([
        [
          {
            message: 'Re-synced testAppName on argoinstance1',
            status: 'Success',
          },
        ],
      ]);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/applications/testAppName/sync'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token',
          }),
        }),
      );
    });

    describe('deleteAppandProject', () => {
      let deleteAppMock: jest.SpyInstance<ReturnType<ArgoService['deleteApp']>>;
      let deleteProjectMock: jest.SpyInstance<
        ReturnType<ArgoService['deleteProject']>
      >;
      let getArgoApplicationInfoMock: jest.SpyInstance<
        ReturnType<ArgoService['getArgoApplicationInfo']>
      >;
      let terminateArgoAppOperationMock: jest.SpyInstance<
        ReturnType<ArgoService['terminateArgoAppOperation']>
      >;

      beforeEach(() => {
        deleteAppMock = jest.spyOn(ArgoService.prototype, 'deleteApp');
        deleteProjectMock = jest.spyOn(ArgoService.prototype, 'deleteProject');
        getArgoApplicationInfoMock = jest.spyOn(
          ArgoService.prototype,
          'getArgoApplicationInfo',
        );
        terminateArgoAppOperationMock = jest.spyOn(
          ArgoService.prototype,
          'terminateArgoAppOperation',
        );
      });

      it('deletes project after deletion of the application is successful due to the application not existing', async () => {
        deleteAppMock.mockResolvedValueOnce({
          message: 'application not found',
          statusCode: 404,
          code: 1,
          error: 'error',
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(resp).toStrictEqual({
          deleteAppDetails: {
            status: 'success',
            message:
              'application testApp does not exist and therefore does not need to be deleted',
            argoResponse: {
              message: 'application not found',
              statusCode: 404,
              code: 1,
              error: 'error',
            },
          },
          deleteProjectDetails: {
            status: 'pending',
            message: 'project testApp is pending deletion.',
            argoResponse: {
              statusCode: 200,
            },
          },
        });
      });

      it('skips project deletion when application deletion fails', async () => {
        deleteAppMock.mockResolvedValueOnce({
          code: 1,
          error: 'some error occurred',
          message: 'some error occurred',
          statusCode: 500,
        });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(getArgoApplicationInfoMock).not.toHaveBeenCalled();
        expect(deleteProjectMock).not.toHaveBeenCalled();
        expect(resp).toStrictEqual({
          deleteAppDetails: {
            status: 'failed',
            message: 'failed to delete application testApp',
            argoResponse: {
              code: 1,
              error: 'some error occurred',
              message: 'some error occurred',
              statusCode: 500,
            },
          },
          deleteProjectDetails: {
            status: 'failed',
            message:
              'project testApp deletion skipped due to application still existing and pending deletion, or the application failed to delete.',
            argoResponse: {},
          },
        });
      });

      it('skips project deletion when application is pending to delete', async () => {
        deleteAppMock.mockResolvedValueOnce({
          statusCode: 200,
        });

        getArgoApplicationInfoMock.mockResolvedValueOnce({
          metadata: {
            name: 'testAppName',
            namespace: 'testNamespace',
          },
          statusCode: 200,
        });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(deleteProjectMock).not.toHaveBeenCalled();
        expect(resp).toStrictEqual({
          deleteAppDetails: {
            status: 'pending',
            message:
              'application testApp still pending deletion with the deletion timestamp of undefined',
            argoResponse: {
              metadata: {
                name: 'testAppName',
                namespace: 'testNamespace',
              },
              statusCode: 200,
            },
          },
          deleteProjectDetails: {
            status: 'failed',
            message:
              'project testApp deletion skipped due to application still existing and pending deletion, or the application failed to delete.',
            argoResponse: {},
          },
        });
      });

      it('skips project deletion when application deletion status is unknown', async () => {
        deleteAppMock.mockResolvedValueOnce({
          statusCode: 200,
        });

        getArgoApplicationInfoMock.mockResolvedValueOnce({
          message: 'something happened',
          code: 1,
          error: 'something happened',
          statusCode: 500,
        });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(deleteProjectMock).not.toHaveBeenCalled();
        expect(resp).toStrictEqual({
          deleteAppDetails: {
            status: 'failed',
            message:
              'a request was successfully sent to delete application testApp, but when getting your application information we received an error',
            argoResponse: {
              code: 1,
              error: 'something happened',
              message: 'something happened',
              statusCode: 500,
            },
          },
          deleteProjectDetails: {
            status: 'failed',
            message:
              'project testApp deletion skipped due to application still existing and pending deletion, or the application failed to delete.',
            argoResponse: {},
          },
        });
      });

      it('deletes app and project successfully', async () => {
        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValueOnce({
          message: 'application not found',
          error: 'error',
          code: 1,
          statusCode: 404,
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(resp).toStrictEqual({
          deleteAppDetails: {
            status: 'success',
            message:
              'application testApp deletion verified (application no longer exists)',
            argoResponse: {
              code: 1,
              error: 'error',
              message: 'application not found',
              statusCode: 404,
            },
          },
          deleteProjectDetails: {
            status: 'pending',
            message: 'project testApp is pending deletion.',
            argoResponse: { statusCode: 200 },
          },
        });
      });
      it('should successfully delete app and fail to delete project returning error message', async () => {
        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValueOnce({
          message: 'application not found',
          error: 'error',
          code: 1,
          statusCode: 404,
        });

        deleteProjectMock.mockResolvedValueOnce({
          error: 'something unexpected',
          message: 'something unexpected',
          code: 1,
          statusCode: 500,
        });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(resp).toStrictEqual({
          deleteAppDetails: {
            status: 'success',
            message:
              'application testApp deletion verified (application no longer exists)',
            argoResponse: {
              code: 1,
              error: 'error',
              message: 'application not found',
              statusCode: 404,
            },
          },
          deleteProjectDetails: {
            status: 'failed',
            message: 'failed to delete project testApp.',
            argoResponse: {
              error: 'something unexpected',
              message: 'something unexpected',
              code: 1,
              statusCode: 500,
            },
          },
        });
      });
      it('communicates when terminate operation is unsuccessful', async () => {
        terminateArgoAppOperationMock.mockResolvedValueOnce({
          message: 'something happened',
          statusCode: 500,
          code: 1,
          error: 'error',
        });

        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValueOnce({
          message: 'some error',
          error: 'error',
          code: 1,
          statusCode: 500,
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
          terminateOperation: true,
        });

        expect(resp).toEqual(
          expect.objectContaining({
            terminateOperationDetails: {
              status: 'failed',
              message: `failed to terminate testApp's operation for application`,
              argoResponse: {
                message: 'something happened',
                statusCode: 500,
                code: 1,
                error: 'error',
              },
            },
          }),
        );
      });
      it('communicates when terminate operation cannot find application', async () => {
        terminateArgoAppOperationMock.mockResolvedValueOnce({
          message: 'not found',
          statusCode: 404,
          error: 'error',
          code: 1,
        });

        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValueOnce({
          message: 'some error',
          error: 'error',
          code: 1,
          statusCode: 500,
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
          terminateOperation: true,
        });

        expect(resp).toEqual(
          expect.objectContaining({
            terminateOperationDetails: {
              status: 'failed',
              message: 'application testApp not found',
              argoResponse: {
                message: 'not found',
                statusCode: 404,
                error: 'error',
                code: 1,
              },
            },
          }),
        );
      });
      it('terminates operation when terminate set to true', async () => {
        terminateArgoAppOperationMock.mockResolvedValueOnce({
          statusCode: 200,
        });

        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValueOnce({
          message: 'application not found',
          error: 'error',
          code: 1,
          statusCode: 404,
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
          terminateOperation: true,
        });

        expect(terminateArgoAppOperationMock).toHaveBeenCalled();
        expect(resp).toStrictEqual({
          deleteAppDetails: {
            status: 'success',
            message:
              'application testApp deletion verified (application no longer exists)',
            argoResponse: {
              code: 1,
              error: 'error',
              message: 'application not found',
              statusCode: 404,
            },
          },
          deleteProjectDetails: {
            status: 'pending',
            message: 'project testApp is pending deletion.',
            argoResponse: { statusCode: 200 },
          },
          terminateOperationDetails: {
            status: 'success',
            message: `testApp's current operation terminated`,
            argoResponse: { statusCode: 200 },
          },
        });
      });

      it('communicates when project was not found for deletion', async () => {
        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValueOnce({
          message: 'application not found',
          code: 1,
          error: 'error',
          statusCode: 404,
        });

        deleteProjectMock.mockResolvedValueOnce({
          code: 1,
          message: 'not found',
          error: 'error',
          statusCode: 404,
        });

        const resp = await argoService.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(resp).toEqual(
          expect.objectContaining({
            deleteProjectDetails: {
              status: 'success',
              message:
                'project testApp does not exist and therefore does not need to be deleted.',
              argoResponse: {
                code: 1,
                message: 'not found',
                error: 'error',
                statusCode: 404,
              },
            },
          }),
        );
      });

      it('checks if app is deleted for two cycles', async () => {
        const argoServiceWaitCycles = createService({
          instanceCredentials: { token: 'token' },
          waitCycles: 2,
        });
        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValue({
          metadata: {
            name: 'testApp',
          },
          statusCode: 200,
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        await argoServiceWaitCycles.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(getArgoApplicationInfoMock).toHaveBeenCalledTimes(2);
        expect(mocked(timer)).toHaveBeenCalledTimes(1);
      });

      it('checks if app is deleted for more than 2 cycles', async () => {
        const argoServiceWaitCycles = createService({
          instanceCredentials: { token: 'token' },
          waitCycles: 3,
        });
        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValue({
          metadata: {
            name: 'testApp',
          },
          statusCode: 200,
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        await argoServiceWaitCycles.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(getArgoApplicationInfoMock).toHaveBeenCalledTimes(3);
        expect(mocked(timer)).toHaveBeenCalledTimes(2);
      });

      it('waits the default amount of time when no interval time is provided', async () => {
        const argoServiceWaitInterval = createService({
          instanceCredentials: { token: 'token' },
          waitCycles: 2,
        });
        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValue({
          metadata: {
            name: 'testApp',
          },
          statusCode: 200,
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        await argoServiceWaitInterval.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(getArgoApplicationInfoMock).toHaveBeenCalledTimes(2);
        expect(mocked(timer)).toHaveBeenCalledTimes(1);
        expect(mocked(timer)).toHaveBeenCalledWith(5000);
      });

      it('waits the given amount of time configured when looping to check if application has been deleted', async () => {
        const argoServiceWaitInterval = createService({
          instanceCredentials: { token: 'token' },
          waitCycles: 2,
          waitInterval: 2000,
        });
        deleteAppMock.mockResolvedValueOnce({ statusCode: 200 });

        getArgoApplicationInfoMock.mockResolvedValue({
          metadata: {
            name: 'testApp',
          },
          statusCode: 200,
        });

        deleteProjectMock.mockResolvedValueOnce({ statusCode: 200 });

        await argoServiceWaitInterval.deleteAppandProject({
          argoAppName: 'testApp',
          argoInstanceName: 'argoinstance1',
        });

        expect(getArgoApplicationInfoMock).toHaveBeenCalledTimes(2);
        expect(mocked(timer)).toHaveBeenCalledTimes(1);
        expect(mocked(timer)).toHaveBeenCalledWith(2000);
      });
    });

    describe('findArgoApp', () => {
      it('should return the argo instances an argo app is on', async () => {
        fetchMock.mockResponseOnce(
          JSON.stringify({
            metadata: {
              name: 'testApp-nonprod',
              namespace: 'argocd',
              status: {},
            },
          }),
        );

        const resp = await argoService.findArgoApp({ name: 'testApp-nonprod' });

        expect(resp).toStrictEqual([
          {
            name: 'argoinstance1',
            url: 'https://argoinstance1.com',
            appName: ['testApp-nonprod'],
          },
        ]);
      });

      it('should return an empty array even when the request fails', async () => {
        fetchMock.mockRejectOnce(new Error());
        expect(
          await argoService.findArgoApp({ name: 'test-app' }),
        ).toStrictEqual([]);
      });

      it('should return the argo instances using the app selector', async () => {
        fetchMock.mockResponseOnce(
          JSON.stringify({
            items: [
              {
                metadata: {
                  name: 'testApp-nonprod',
                  namespace: 'argocd',
                  status: {},
                },
              },
            ],
          }),
        );

        const resp = await argoService.findArgoApp({
          selector: 'name=testApp-nonprod',
        });

        expect(resp).toStrictEqual([
          {
            appName: ['testApp-nonprod'],
            name: 'argoinstance1',
            url: 'https://argoinstance1.com',
          },
        ]);
      });

      it('returns empty array when get token call fails', async () => {
        fetchMock.mockRejectedValueOnce(new Error('FetchError'));

        const resp = await argoServiceForNoToken.findArgoApp({
          selector: 'name=testApp-nonprod',
        });

        expect(resp).toStrictEqual([]);
      });

      it('logs error when token call fails', async () => {
        fetchMock.mockRejectedValueOnce(new Error('FetchError'));

        await argoServiceForNoToken.findArgoApp({
          selector: 'name=testApp-nonprod',
        });

        expect(logger.error).toHaveBeenCalledWith(
          'Error getting token from Argo Instance argoinstance1: FetchError',
        );
      });
    });

    describe('updateArgoProjectAndApp', () => {
      const data: UpdateArgoProjectAndAppProps = {
        instanceConfig: {
          name: 'argoInstanceName',
          url: 'http://argoinstance.com',
        },
        argoToken: 'argoToken',
        appName: 'appName',
        projectName: 'projectName',
        namespace: 'namespace',
        sourceRepo: 'sourceRepo',
        sourcePath: 'sourcePath',
        labelValue: 'labelValue',
      };
      const getArgoAppDataResp = {
        metadata: {
          name: 'argoInstanceName',
          resourceVersion: 'resourceVersion',
        },
        spec: { source: { repoURL: 'sourceRepo' } },
        status: {},
        instance: 'instance',
      };
      const getArgoProjectResp = {
        metadata: { resourceVersion: 'resourceVersion' },
      };
      it('should throw error when argo app not found', async () => {
        fetchMock.mockResponseOnce('', { status: 404 }); // getArgoAppData
        await expect(argoService.updateArgoProjectAndApp(data)).rejects.toThrow(
          'Request failed with 404 Error',
        );
      });

      it('should throw error when source url undefined', async () => {
        fetchMock.mockResponseOnce(
          JSON.stringify({
            ...getArgoAppDataResp,
            spec: { source: { repoURL: '' } },
          }),
        ); // getArgoAppData
        await expect(argoService.updateArgoProjectAndApp(data)).rejects.toThrow(
          'No repo URL found for argo app',
        );
      });

      it('should throw error when app resourceVersion undefined', async () => {
        fetchMock.mockResponseOnce(
          JSON.stringify({ ...getArgoAppDataResp, metadata: {} }),
        ); // getArgoAppData
        await expect(argoService.updateArgoProjectAndApp(data)).rejects.toThrow(
          'No resourceVersion found for argo app',
        );
      });

      it('should throw error when project resourceVersion undefined', async () => {
        fetchMock
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // getArgoAppData
          .mockResponseOnce(JSON.stringify({ metadata: {} })); // getArgoProject
        await expect(argoService.updateArgoProjectAndApp(data)).rejects.toThrow(
          'No resourceVersion found for argo project',
        );
      });

      it('should throw error when argo project update fails', async () => {
        fetchMock
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // getArgoAppData
          .mockResponseOnce(JSON.stringify(getArgoProjectResp)) // getArgoProject
          .mockResponseOnce(JSON.stringify({ message: 'ERROR' }), {
            status: 500,
          }); // updateArgoProject

        await expect(argoService.updateArgoProjectAndApp(data)).rejects.toThrow(
          'Error updating argo project: ERROR',
        );
      });

      it('should throw error when argo app update fails', async () => {
        fetchMock
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // getArgoAppData
          .mockResponseOnce(JSON.stringify(getArgoProjectResp)) // getArgoProject
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // updateArgoProject
          .mockResponseOnce(JSON.stringify({ message: 'ERROR' }), {
            status: 500,
          }); // updateArgoApp

        await expect(argoService.updateArgoProjectAndApp(data)).rejects.toThrow(
          'Error updating argo app: ERROR',
        );
      });

      it('should send correct project payload', async () => {
        fetchMock
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // getArgoAppData
          .mockResponseOnce(JSON.stringify(getArgoProjectResp)) // getArgoProject
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // updateArgoProject
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)); // updateArgoApp

        await argoService.updateArgoProjectAndApp(data);

        const fetchBody = JSON.parse(
          fetchMock.mock.calls[2][1]?.body as string,
        );

        expect(fetchBody).toStrictEqual(
          expect.objectContaining({
            project: {
              metadata: expect.objectContaining({
                name: 'projectName',
              }),
              spec: expect.objectContaining({
                destinations: [
                  {
                    name: 'local',
                    namespace: 'namespace',
                    server: 'https://kubernetes.default.svc',
                  },
                ],
                sourceRepos: ['sourceRepo'],
              }),
            },
          }),
        );
      });

      it('should return true when app and project update succeeds', async () => {
        fetchMock
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // getArgoAppData
          .mockResponseOnce(JSON.stringify(getArgoProjectResp)) // getArgoProject
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // updateArgoProject
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)); // updateArgoApp

        const resp = await argoService.updateArgoProjectAndApp(data);

        expect(resp).toBe(true);
      });

      it('should return true when app and project update succeeds and source repo changes', async () => {
        fetchMock
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // getArgoAppData
          .mockResponseOnce(JSON.stringify(getArgoProjectResp)) // getArgoProject
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // updateArgoProject
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)) // updateArgoApp
          .mockResponseOnce(JSON.stringify(getArgoProjectResp)) // getArgoProject
          .mockResponseOnce(JSON.stringify(getArgoAppDataResp)); // updateArgoProject

        const newData = { ...data, sourceRepo: 'newRepo' };

        const resp = await argoService.updateArgoProjectAndApp(newData);

        expect(resp).toBe(true);
      });
    });

    describe('getArgoProject', () => {
      const projectData = { metadata: { resourceVersion: 'resourceVersion' } };
      const argoProjectReq = {
        baseUrl: 'http://baseurl.com',
        argoToken: 'token',
        projectName: 'projectName',
      };

      it('should get project data', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(projectData));

        const resp = await argoService.getArgoProject(argoProjectReq);

        expect(resp).toStrictEqual(projectData);
      });

      it('should throw an error when fail to get project', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ message: 'ERROR' }), {
          status: 500,
        });

        await expect(
          argoService.getArgoProject(argoProjectReq),
        ).rejects.toThrow('Failed to get argo project: ERROR');
      });
    });

    describe('getApplicationData', () => {
      it('returns argo application data by calling argo api', async () => {
        fetchMock.mockResponseOnce(
          JSON.stringify({
            metadata: { name: 'application' },
          }),
        );

        const resp = await argoService.getArgoApplicationInfo({
          argoApplicationName: 'application',
          argoInstanceName: 'argoinstance1',
        });

        expect(resp).toEqual(
          expect.objectContaining({
            metadata: { name: 'application' },
            statusCode: 200,
          }),
        );
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          'https://argoinstance1.com/api/v1/applications/application',
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer token',
              'Content-Type': 'application/json',
            },
          }),
        );
      });

      it('fails to find argo application data because application of arbitrary argo error', async () => {
        fetchMock.mockResponseOnce(
          JSON.stringify({
            error: 'some error',
            message: 'some error',
          }),
          { status: 1 },
        );

        const resp = await argoService.getArgoApplicationInfo({
          argoApplicationName: 'application',
          argoInstanceName: 'argoinstance1',
        });

        expect(resp).toEqual(
          expect.objectContaining({
            error: 'some error',
            message: 'some error',
            statusCode: 1,
          }),
        );
      });

      it('fails because argo cluster is not found', async () => {
        await expect(
          argoService.getArgoApplicationInfo({
            argoApplicationName: 'application',
            argoInstanceName: 'cluster',
          }),
        ).rejects.toThrow(/does not have argo information/i);
      });

      it('fails because credentials are incorrect', async () => {
        const mockGetArgoToken = jest
          .spyOn(ArgoService.prototype, 'getArgoToken')
          .mockRejectedValueOnce('Unauthorized');

        await expect(
          argoServiceForNoToken.getArgoApplicationInfo({
            argoApplicationName: 'application',
            argoInstanceName: 'argoinstance1',
          }),
        ).rejects.toEqual('Unauthorized');

        expect(mockGetArgoToken).toHaveBeenCalledTimes(1);
      });

      it('fails to get argo application information for other reasons', async () => {
        fetchMock.mockResponseOnce('', { status: 500 });

        await expect(
          argoService.getArgoApplicationInfo({
            argoApplicationName: 'application',
            argoInstanceName: 'argoinstance1',
          }),
        ).rejects.toThrow(/invalid json/i);
      });

      it('gets application information when provided base url and token', async () => {
        fetchMock.mockResponseOnce(
          JSON.stringify({
            metadata: { name: 'testApp' },
          }),
        );

        const response = await argoService.getArgoApplicationInfo({
          argoApplicationName: 'application',
          baseUrl: 'https://argoinstance1.com',
          argoToken: 'token',
        });

        expect(response).toEqual(
          expect.objectContaining({
            metadata: { name: 'testApp' },
            statusCode: 200,
          }),
        );
      });
    });

    describe('resource black and white lists', () => {
      beforeEach(() => {
        fetchMock.mockResponseOnce(JSON.stringify({}));
      });

      it('should include cluster and namespace white and black list if provided in the config', async () => {
        const service = createService({
          instanceCredentials: { token: 'token' },
          clusterResourceWhitelist: [
            { kind: 'clusterWhitelistKind', group: 'clusterWhitelistGroup' },
          ],
          clusterResourceBlacklist: [
            { kind: 'clusterBlacklistKind', group: 'clusterBlacklistGroup' },
          ],
          namespaceResourceWhitelist: [
            {
              kind: 'namespaceWhitelistKind',
              group: 'namespaceWhitelistGroup',
            },
          ],
          namespaceResourceBlacklist: [
            {
              kind: 'namespaceBlacklistKind',
              group: 'namespaceBlacklistGroup',
            },
          ],
        });

        await service.createArgoProject({
          baseUrl: 'http://baseurl.com',
          argoToken: 'token',
          projectName: 'projectName',
          namespace: 'namespace',
          sourceRepo: 'repo',
        });

        expect(fetchMock.mock.calls[0][1]?.body).toContain(
          JSON.stringify([
            {
              kind: 'clusterBlacklistKind',
              group: 'clusterBlacklistGroup',
            },
          ]),
        );
        expect(fetchMock.mock.calls[0][1]?.body).toContain(
          JSON.stringify([
            {
              kind: 'clusterWhitelistKind',
              group: 'clusterWhitelistGroup',
            },
          ]),
        );
        expect(fetchMock.mock.calls[0][1]?.body).toContain(
          JSON.stringify([
            {
              kind: 'namespaceBlacklistKind',
              group: 'namespaceBlacklistGroup',
            },
          ]),
        );
        expect(fetchMock.mock.calls[0][1]?.body).toContain(
          JSON.stringify([
            {
              kind: 'namespaceWhitelistKind',
              group: 'namespaceWhitelistGroup',
            },
          ]),
        );
      });

      it('should not include namespace white or black lists', async () => {
        const service = createService({
          instanceCredentials: { token: 'token' },
          clusterResourceWhitelist: [
            { kind: 'clusterWhitelistKind', group: 'clusterWhitelistGroup' },
          ],
          clusterResourceBlacklist: [
            { kind: 'clusterBlacklistKind', group: 'clusterBlacklistGroup' },
          ],
        });

        await service.createArgoProject({
          baseUrl: 'http://baseurl.com',
          argoToken: 'token',
          projectName: 'projectName',
          namespace: 'namespace',
          sourceRepo: 'repo',
        });

        expect(fetchMock.mock.calls[0][1]?.body).toContain(
          JSON.stringify([
            {
              kind: 'clusterBlacklistKind',
              group: 'clusterBlacklistGroup',
            },
          ]),
        );
        expect(fetchMock.mock.calls[0][1]?.body).toContain(
          JSON.stringify([
            {
              kind: 'clusterWhitelistKind',
              group: 'clusterWhitelistGroup',
            },
          ]),
        );
        expect(fetchMock.mock.calls[0][1]?.body).not.toContain(
          JSON.stringify([
            {
              kind: 'namespaceBlacklistKind',
              group: 'namespaceBlacklistGroup',
            },
          ]),
        );
        expect(fetchMock.mock.calls[0][1]?.body).not.toContain(
          JSON.stringify([
            {
              kind: 'namespaceWhitelistKind',
              group: 'namespaceWhitelistGroup',
            },
          ]),
        );
      });

      it('should not include any black or white lists', async () => {
        const service = createService({
          instanceCredentials: { token: 'token' },
        });

        await service.createArgoProject({
          baseUrl: 'http://baseurl.com',
          argoToken: 'token',
          projectName: 'projectName',
          namespace: 'namespace',
          sourceRepo: 'repo',
        });
        expect(fetchMock.mock.calls[0][1]?.body).not.toContain(
          'clusterResourceWhitelist',
        );
        expect(fetchMock.mock.calls[0][1]?.body).not.toContain(
          'clusterResourceBlacklist',
        );
        expect(fetchMock.mock.calls[0][1]?.body).not.toContain(
          'namespaceResourceWhitelist',
        );
        expect(fetchMock.mock.calls[0][1]?.body).not.toContain(
          'namespaceResourceBlacklist',
        );
      });
    });

    describe('terminateArgoAppOperation', () => {
      it('terminates argo application operation by calling argo api with app name and instance provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

        const resp = await argoService.terminateArgoAppOperation({
          argoAppName: 'application',
          argoInstanceName: 'argoinstance1',
        });

        expect(resp).toEqual(expect.objectContaining({ statusCode: 200 }));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          'https://argoinstance1.com/api/v1/applications/application/operation',
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer token',
              'Content-Type': 'application/json',
            },
            method: 'DELETE',
          }),
        );
      });
      it('terminates argo application operation by calling argo api with app name, baseurl, and token provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

        const resp = await argoService.terminateArgoAppOperation({
          argoAppName: 'application',
          baseUrl: 'https://passedArgoinstance1.com',
          argoToken: 'passedToken',
        });

        expect(resp).toEqual(expect.objectContaining({ statusCode: 200 }));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringMatching(
            /https:\/\/passedargoinstance1\.com\/api\/v1\/applications\/application\/operation/i,
          ),
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer passedToken',
              'Content-Type': 'application/json',
            },
            method: 'DELETE',
          }),
        );
      });

      it('fails to terminate operation because of some arbitrary argo api error', async () => {
        fetchMock.mockResponseOnce(
          JSON.stringify({
            error: 'some error',
            message: 'some error',
          }),
          { status: 1 },
        );

        const resp = await argoService.terminateArgoAppOperation({
          argoAppName: 'application',
          argoInstanceName: 'argoinstance1',
        });

        expect(resp).toEqual(
          expect.objectContaining({
            error: 'some error',
            message: 'some error',
            statusCode: 1,
          }),
        );
      });

      it('fails because credentials are incorrect', async () => {
        const mockGetArgoToken = jest
          .spyOn(ArgoService.prototype, 'getArgoToken')
          .mockRejectedValueOnce('Unauthorized');

        await expect(
          argoServiceForNoToken.terminateArgoAppOperation({
            argoAppName: 'application',
            argoInstanceName: 'argoinstance1',
          }),
        ).rejects.toEqual('Unauthorized');

        expect(mockGetArgoToken).toHaveBeenCalledTimes(1);
      });

      it('fails because argo cluster is not found', async () => {
        await expect(
          argoService.terminateArgoAppOperation({
            argoAppName: 'application',
            argoInstanceName: 'cluster',
          }),
        ).rejects.toThrow(/does not have argo information/i);
      });

      it('raises error if argo instance not included and either base url or token not included', async () => {
        await expect(
          argoService.terminateArgoAppOperation({
            argoAppName: 'application',
            argoToken: 'token',
            baseUrl: '',
          }),
        ).rejects.toThrow(/argo instance must be defined/i);
      });

      it('fails to get argo application information for other reasons', async () => {
        fetchMock.mockResponseOnce('', { status: 500 });

        await expect(
          argoService.terminateArgoAppOperation({
            argoAppName: 'application',
            argoInstanceName: 'argoinstance1',
          }),
        ).rejects.toThrow(/invalid json/i);
      });
    });

    describe('getArgoToken', () => {
      it('uses token from argo instance when only token provided', async () => {
        const argoCdService = createService({
          instanceCredentials: { token: 'token' },
        });

        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(token).toEqual('token');
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('prioritizes token from argo instance when token, username, and password provided', async () => {
        const argoCdService = createService({
          instanceCredentials: {
            token: 'token',
            username: 'username',
            password: 'password',
          },
        });

        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(token).toEqual('token');
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('retrieves argo token using instance level username and password when upper level username and password is not provided', async () => {
        const argoCdService = createService({
          instanceCredentials: { username: 'username', password: 'password' },
        });
        fetchMock.mockResponseOnce(JSON.stringify({ token: 'token' }));

        const token = await argoCdService.getArgoToken(
          argoServiceForNoToken.instanceConfigs[0],
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `${argoCdService.instanceConfigs[0].url}/api/v1/session`,
          expect.objectContaining({
            body: JSON.stringify({ username: 'user', password: 'pass' }),
          }),
        );
        expect(token).toEqual('token');
      });

      it('uses instance level token when upper level username and password provided', async () => {
        const argoConfig = getConfig({
          instanceCredentials: { token: 'token' },
        });
        const argoCdService = new ArgoService(
          'upper-level-username',
          'upper-level-password',
          argoConfig,
          logger,
        );

        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(token).toEqual('token');
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('retrieves argo token using instance level username and password when upper level username and password provided', async () => {
        const argoConfig = getConfig({
          instanceCredentials: { username: 'username', password: 'password' },
        });
        const argoCdService = new ArgoService(
          'upper-level-username',
          'upper-level-password',
          argoConfig,
          logger,
        );

        fetchMock.mockResponseOnce(JSON.stringify({ token: 'token' }));

        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `${argoCdService.instanceConfigs[0].url}/api/v1/session`,
          expect.objectContaining({
            body: JSON.stringify({
              username: 'username',
              password: 'password',
            }),
          }),
        );
        expect(token).toEqual('token');
      });

      it('retrieves argo token using upper level username and password when no instance credentials provided', async () => {
        const argoConfig = getConfig({});
        const argoCdService = new ArgoService(
          'upper-level-username',
          'upper-level-password',
          argoConfig,
          logger,
        );

        fetchMock.mockResponseOnce(JSON.stringify({ token: 'token' }));

        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `${argoCdService.instanceConfigs[0].url}/api/v1/session`,
          expect.objectContaining({
            body: JSON.stringify({
              username: 'upper-level-username',
              password: 'upper-level-password',
            }),
          }),
        );
        expect(token).toEqual('token');
      });

      it('retrieves argo token using azure credentials when no other credentials provided', async () => {
        const azureConfig = {
          tenantId: 'tenantId',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          loginUrl: 'loginUrl',
        };
        const argoConfig = getConfig({
          otherRootConfigs: { azure: azureConfig },
          oidcConfig: { provider: 'azure', providerConfigKey: 'azure' },
        });
        const argoCdService = new ArgoService('', '', argoConfig, logger);

        fetchMock.mockResponseOnce(
          JSON.stringify({ access_token: 'azure_token' }),
        );

        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `${azureConfig.loginUrl}/${azureConfig.tenantId}/oauth2/v2.0/token`,
          expect.objectContaining({
            body: new URLSearchParams({
              grant_type: 'client_credentials',
              client_id: azureConfig.clientId,
              client_secret: azureConfig.clientSecret,
              scope: `${azureConfig.clientId}/.default`,
            }).toString(),
          }),
        );
        expect(token).toEqual('azure_token');
      });

      it('throws when unable to get argo token from azure login', async () => {
        const azureConfig = {
          tenantId: 'tenantId',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          loginUrl: 'loginUrl',
        };
        const argoConfig = getConfig({
          otherRootConfigs: { azure: azureConfig },
          oidcConfig: { provider: 'azure', providerConfigKey: 'azure' },
        });
        const argoCdService = new ArgoService('', '', argoConfig, logger);

        fetchMock.mockResponseOnce(
          JSON.stringify({
            error: 'error',
            error_description: 'error_description',
            error_codes: [1],
          }),
          {
            status: 2,
          },
        );

        await expect(
          argoCdService.getArgoToken(argoCdService.instanceConfigs[0]),
        ).rejects.toThrow(
          'Failed to get argo token through your azure config credentials: error_description (error, codes: [1], status code: 2)',
        );
      });

      it('returns instance level token from argo instance when azure credentials provided', async () => {
        const azureConfig = {
          tenantId: 'tenantId',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          loginUrl: 'loginUrl',
        };
        const argoConfig = getConfig({
          otherRootConfigs: { azure: azureConfig },
          oidcConfig: { provider: 'azure', providerConfigKey: 'azure' },
          instanceCredentials: { token: 'token' },
        });
        const argoCdService = ArgoService.fromConfig({
          config: argoConfig,
          logger,
        });

        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(fetchMock).not.toHaveBeenCalled();
        expect(token).toBe('token');
      });

      it('retrieves argo token using instance level username and password when azure credentials provided', async () => {
        const azureConfig = {
          tenantId: 'tenantId',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          loginUrl: 'loginUrl',
        };
        const argoConfig = getConfig({
          otherRootConfigs: { azure: azureConfig },
          oidcConfig: { provider: 'azure', providerConfigKey: 'azure' },
          instanceCredentials: { username: 'username', password: 'password' },
        });
        const argoCdService = ArgoService.fromConfig({
          config: argoConfig,
          logger,
        });
        fetchMock.mockResponseOnce(JSON.stringify({ token: 'token' }));
        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `${argoCdService.instanceConfigs[0].url}/api/v1/session`,
          expect.objectContaining({
            body: JSON.stringify({
              username: 'username',
              password: 'password',
            }),
          }),
        );
        expect(token).toEqual('token');
      });

      it('retrieves argo token using upper level username and password when azure credentials provided', async () => {
        const azureConfig = {
          tenantId: 'tenantId',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          loginUrl: 'loginUrl',
        };
        const argoConfig = getConfig({
          otherRootConfigs: { azure: azureConfig },
          oidcConfig: { provider: 'azure', providerConfigKey: 'azure' },
        });
        const argoCdService = new ArgoService(
          'upper-level-username',
          'upper-level-password',
          argoConfig,
          logger,
        );
        fetchMock.mockResponseOnce(JSON.stringify({ token: 'token' }));
        const token = await argoCdService.getArgoToken(
          argoCdService.instanceConfigs[0],
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
          `${argoCdService.instanceConfigs[0].url}/api/v1/session`,
          expect.objectContaining({
            body: JSON.stringify({
              username: 'upper-level-username',
              password: 'upper-level-password',
            }),
          }),
        );
        expect(token).toEqual('token');
      });

      it('throws when upper level username and password, argoInstanceConfig, and azureCredentials are undefined', async () => {
        const argoConfig = getConfig({});
        const argoCdService = new ArgoService('', '', argoConfig, logger);
        await expect(
          argoCdService.getArgoToken(argoCdService.instanceConfigs[0]),
        ).rejects.toThrow('Missing credentials in config for Argo Instance.');
      });

      it('retreives azure credentials from config based on provider config key', async () => {
        const azureConfig = {
          tenantId: 'tenantId',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          loginUrl: 'loginUrl',
        };
        const argoConfigAzure = getConfig({
          otherRootConfigs: { azure: azureConfig },
          oidcConfig: { provider: 'azure', providerConfigKey: 'azure' },
        });
        const getSpy = jest.spyOn(argoConfigAzure, 'get');
        fetchMock.mockResponse(JSON.stringify({ token: 'token' }));
        const argoCdService = new ArgoService('', '', argoConfigAzure, logger);
        await argoCdService.getArgoToken(argoCdService.instanceConfigs[0]);

        expect(getSpy).toHaveBeenCalledWith('azure');

        const argoConfigNotAzure = getConfig({
          otherRootConfigs: { test: azureConfig },
          oidcConfig: { provider: 'azure', providerConfigKey: 'test' },
        });
        const getSpyNotAzure = jest.spyOn(argoConfigNotAzure, 'get');
        const argoCdServiceNotAzure = new ArgoService(
          '',
          '',
          argoConfigNotAzure,
          logger,
        );
        await argoCdServiceNotAzure.getArgoToken(
          argoCdServiceNotAzure.instanceConfigs[0],
        );

        expect(getSpyNotAzure).toHaveBeenCalledWith('test');
      });

      it('throws when provider config key is not found in config', async () => {
        const azureConfig = {
          tenantId: 'tenantId',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          loginUrl: 'loginUrl',
        };
        const providerConfigKey = 'notHere';
        const argoConfig = getConfig({
          otherRootConfigs: { here: azureConfig },
          oidcConfig: { provider: 'azure', providerConfigKey },
        });
        const argoCdService = new ArgoService('', '', argoConfig, logger);
        const getSpy = jest.spyOn(argoConfig, 'get');

        await expect(
          argoCdService.getArgoToken(argoCdService.instanceConfigs[0]),
        ).rejects.toThrow(
          `Missing required config value at '${providerConfigKey}' in ''`,
        );

        expect(getSpy).toHaveBeenCalledWith(providerConfigKey);
      });
    });
  });
});
