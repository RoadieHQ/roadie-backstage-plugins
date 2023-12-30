import { ArgoCDApiClient } from './index';
import {
  getDiscoveryApiStub,
  getIdentityApiStub,
  getServiceListStub,
} from '../mocks/mocks';

describe('API calls', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore(); // restore original fetch after each test
  });

  describe('#listApps', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      );
    });

    it('fetches app based on provided projectName', async () => {
      const client = new ArgoCDApiClient({
        discoveryApi: getDiscoveryApiStub,
        backendBaseUrl: '',
        searchInstances: false,
        identityApi: getIdentityApiStub,
        useNamespacedApps: false,
      });

      await client.listApps({
        url: '/argocd/api',
        projectName: 'test',
        appNamespace: 'my-test-ns',
      });

      // Let's verify the fetch was called with the requested URL and Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/proxy/argocd/api/applications?project=test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-id-token`,
          },
        }),
      );
    });

    it('fetches app based on provided appSelector', async () => {
      const client = new ArgoCDApiClient({
        discoveryApi: getDiscoveryApiStub,
        backendBaseUrl: '',
        searchInstances: false,
        identityApi: getIdentityApiStub,
        useNamespacedApps: false,
      });

      await client.listApps({
        url: '/argocd/api',
        appSelector: 'app=test',
        appNamespace: 'my-test-ns',
      });

      // Let's verify the fetch was called with the requested URL and Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/proxy/argocd/api/applications?selector=app%3Dtest',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-id-token`,
          },
        }),
      );
    });

    it('fetches apps when using namespaced apps', async () => {
      const client = new ArgoCDApiClient({
        discoveryApi: getDiscoveryApiStub,
        backendBaseUrl: '',
        searchInstances: false,
        identityApi: getIdentityApiStub,
        useNamespacedApps: true,
      });

      await client.listApps({
        url: '/argocd/api',
        appSelector: 'app=test',
        appNamespace: 'my-test-ns',
      });

      // Let's verify the fetch was called with the requested URL and Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/proxy/argocd/api/applications?selector=app%3Dtest&appNamespace=my-test-ns',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-id-token`,
          },
        }),
      );
    });
  });

  describe('#serviceLocatorUrl', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve(getServiceListStub),
        } as Response),
      );
    });

    it('should make API call with proper authorization in headers', async () => {
      const client = new ArgoCDApiClient({
        discoveryApi: getDiscoveryApiStub,
        backendBaseUrl: '',
        searchInstances: true,
        identityApi: getIdentityApiStub,
        useNamespacedApps: false,
      });

      const response = await client.serviceLocatorUrl({
        appName: 'test',
        appNamespace: 'my-test-ns',
      });

      // Let's verify the fetch was called with the requested URL and Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/argocd/find/name/test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-id-token`,
          },
        }),
      );

      expect(response).toEqual(getServiceListStub);
    });

    it('should make API call when appSelector provided', async () => {
      const client = new ArgoCDApiClient({
        discoveryApi: getDiscoveryApiStub,
        backendBaseUrl: '',
        searchInstances: true,
        identityApi: getIdentityApiStub,
        useNamespacedApps: false,
      });

      const response = await client.serviceLocatorUrl({
        appSelector: 'app=test',
        appNamespace: 'my-test-ns',
      });

      // Let's verify the fetch was called with the requested URL and Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/argocd/find/selector/app%3Dtest',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-id-token`,
          },
        }),
      );

      expect(response).toEqual(getServiceListStub);
    });

    it('returns a response when passed valid appName', async () => {
      const client = new ArgoCDApiClient({
        discoveryApi: getDiscoveryApiStub,
        backendBaseUrl: '',
        searchInstances: true,
        identityApi: getIdentityApiStub,
        useNamespacedApps: false,
      });

      const response = await client.serviceLocatorUrl({ appName: 'test' });
      expect(response).toEqual(getServiceListStub);
    });

    it('throws error when appName and appSelector are not provided', async () => {
      const client = new ArgoCDApiClient({
        discoveryApi: getDiscoveryApiStub,
        backendBaseUrl: '',
        searchInstances: true,
        identityApi: getIdentityApiStub,
        useNamespacedApps: false,
      });

      const error = new Error('Need to provide appName or appSelector');

      await expect(client.serviceLocatorUrl({})).rejects.toThrow(error);
    });

    it('fetches namespaced applications', async () => {
      const client = new ArgoCDApiClient({
        discoveryApi: getDiscoveryApiStub,
        backendBaseUrl: '',
        searchInstances: true,
        identityApi: getIdentityApiStub,
        useNamespacedApps: true,
      });

      const response = await client.serviceLocatorUrl({
        appName: 'test',
        appNamespace: 'my-test-ns',
      });

      // Let's verify the fetch was called with the requested URL and Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/argocd/find/name/test?appNamespace=my-test-ns',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-id-token`,
          },
        }),
      );

      expect(response).toEqual(getServiceListStub);
    });
  });
});
