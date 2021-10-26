jest.mock('axios');
import { ConfigReader } from '@backstage/config';
import axios from 'axios';
import { mocked } from 'ts-jest/utils';
import { ArgoService } from './argocd.service';

const config = ConfigReader.fromConfigs([
  {
    context: '',
    data: {
      argocd: {
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

describe('ArgoCD service', () => {
  const argoService = new ArgoService('testusername', 'testpassword', config);

  beforeEach(() => {
    mocked(axios).mockClear();
    mocked(axios).mockReset();
  });

  it('should get argo app data', async () => {
    mocked(axios.request).mockResolvedValue({
      data: {
        metadata: {
          name: 'testAppName',
          namespace: 'testNamespace',
        },
      },
    });

    const resp = argoService.getArgoAppData(
      'https://argoInstance1.com',
      'argoInstance1',
      'testApp',
      'testToken',
      false,
    );

    expect(await resp).toStrictEqual({
      instance: 'argoInstance1',
      metadata: {
        name: 'testAppName',
        namespace: 'testNamespace',
      },
    });
  });

  it('should fail to get argo app data', async () => {
    mocked(axios.request).mockRejectedValueOnce({
      data: {
        error: 'testError',
      },
    });

    await expect(
      argoService.getArgoAppData(
        'https://argoInstance1.com',
        'argoInstance1',
        'testApp',
        'testToken',
        false,
      ),
    ).rejects.toThrow();
  });

  it('show return the argo instances an argo app is on', async () => {
    mocked(axios.request).mockResolvedValue({
      data: {
        metadata: {
          name: 'testApp-nonprod',
          namespace: 'dx-argocd',
        },
        status: {},
      },
    });

    const resp = argoService.findArgoApp('testApp');

    expect(await resp).toStrictEqual([
      { name: 'argoInstance1', url: 'https://argoInstance1.com' },
    ]);
  });

  it('show fail to return the argo instances an argo app is on', async () => {
    mocked(axios.request).mockRejectedValue({
      status: 500,
    });
    return expect(async () => {
      await argoService.findArgoApp('testApp');
    }).rejects.toThrow();
  });
});
