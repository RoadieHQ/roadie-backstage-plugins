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
      { name: 'testApp' },
      'testToken',
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
        { name: 'testApp' },
        'testToken',
      ),
    ).rejects.toThrow();
  });

  it('should return the argo instances an argo app is on', async () => {
    mocked(axios.request).mockResolvedValue({
      data: {
        metadata: {
          name: 'testApp-nonprod',
          namespace: 'argocd',
          status: {},
        },
      },
    });

    const resp = argoService.findArgoApp({ name: 'testApp-nonprod' });

    expect(await resp).toStrictEqual([
      { name: 'argoInstance1', url: 'https://argoInstance1.com' },
    ]);
  });

  it('should fail to return the argo instances an argo app is on', async () => {
    mocked(axios.request).mockRejectedValue({
      status: 500,
    });
    return expect(async () => {
      await argoService.findArgoApp({ name: 'testApp' });
    }).rejects.toThrow();
  });

  it('should return the argo instances using the app selector', async () => {
    mocked(axios.request).mockResolvedValue({
      data: {
        metadata: {
          name: 'testApp-nonprod',
          namespace: 'argocd',
          status: {},
        },
      },
    });

    const resp = argoService.findArgoApp({ selector: 'name=testApp-nonprod' });

    expect(await resp).toStrictEqual([
      { name: 'argoInstance1', url: 'https://argoInstance1.com' },
    ]);
  });

  it('should successfully decorate the items when using the app selector', async () => {
    mocked(axios.request).mockResolvedValue({
      data: {
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
          }
        ]
      },
    });

    const resp = argoService.getArgoAppData('https://argoInstance1.com',
      'argoInstance1',
      { selector: 'service=testApp' },
      'testToken');

    expect(await resp).toStrictEqual({
      items: [
        {
          metadata: {
            instance: {
              name: 'argoInstance1'
            },
            name: 'testApp-prod',
            namespace: 'argocd',
          },
        },
        {
          metadata: {
            instance: {
              name: 'argoInstance1'
            },
            name: 'testApp-staging',
            namespace: 'argocd',
          },
        },
      ]
    });
  });
});
