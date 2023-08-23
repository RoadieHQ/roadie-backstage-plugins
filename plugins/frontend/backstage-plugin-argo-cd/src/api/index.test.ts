import { ArgoCDApiClient } from './index';
import {
  getDiscoveryApiStub,
  getIdentityApiStub,
  getServiceListStub,
} from '../mocks/mocks';

describe('API calls', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve<Response>({
        ok: true,
        json: () => Promise.resolve(getServiceListStub),
      } as Response),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore(); // restore original fetch after each test
  });

  it('serviceLocatorUrl: should make API call with proper authorization in headers', async () => {
    const client = new ArgoCDApiClient({
      discoveryApi: getDiscoveryApiStub,
      backendBaseUrl: '',
      searchInstances: true,
      identityApi: getIdentityApiStub,
    });

    const response = await client.serviceLocatorUrl({ appName: 'test' });

    // Let's verify the fetch was called with the requested URL and Authorization header
    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer fake-id-token`,
        },
      }),
    );

    expect(response).toEqual(getServiceListStub);
  });

  it('serviceLocatorUrl: returns a response when passed valid appName', async () => {
    const client = new ArgoCDApiClient({
      discoveryApi: getDiscoveryApiStub,
      backendBaseUrl: '',
      searchInstances: true,
      identityApi: getIdentityApiStub,
    });

    const response = await client.serviceLocatorUrl({ appName: 'test' });
    expect(response).toEqual(getServiceListStub);
  });

  it('serviceLocatorUrl: throws error when appName and appSelector are not provided', async () => {
    const client = new ArgoCDApiClient({
      discoveryApi: getDiscoveryApiStub,
      backendBaseUrl: '',
      searchInstances: true,
      identityApi: getIdentityApiStub,
    });

    const error = new Error('Need to provide appName or appSelector');

    await expect(client.serviceLocatorUrl({})).rejects.toThrowError(error);
  });
});
