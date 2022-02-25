import { IdentityApi } from '@backstage/core-plugin-api';
import { ArgoCDApi } from '..';

export const getEntityStub = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/mcalus3/sample-service/blob/master/backstage.yaml',
      'argocd/app-name': 'guestbook',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: 'e8a73cc9-21d4-449e-b97a-5d3ce0b21323',
    etag: 'ZmJkOGVkYjktMDM1ZS00YWIzLTkxMWQtMjI5MDk3N2I5M2Rm',
    generation: 1,
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  spec: {
    type: 'service',
    owner: 'david@roadie.io',
    lifecycle: 'experimental',
  },
};

export const getEntityStubWithAppSelector = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/mcalus3/sample-service/blob/master/backstage.yaml',
      'argocd/app-selector': 'name=guestbook',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: 'e8a73cc9-21d4-449e-b97a-5d3ce0b21323',
    etag: 'ZmJkOGVkYjktMDM1ZS00YWIzLTkxMWQtMjI5MDk3N2I5M2Rm',
    generation: 1,
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  spec: {
    type: 'service',
    owner: 'david@roadie.io',
    lifecycle: 'experimental',
  },
};

export const getResponseStubMissingData = {
  metadata: {
    name: 'guestbook',
  },
  status: {
    sync: {
      status: 'Synced',
      health: {},
    },
  },
};

export const getResponseStub = {
  metadata: {
    name: 'guestbook',
    namespace: 'argocd',
    selfLink:
      '/apis/argoproj.io/v1alpha1/namespaces/argocd/applications/guestbook',
    uid: 'f959d66b-9ef2-4819-a1f2-f35874b61303',
    resourceVersion: '7277391',
    generation: 23872,
    creationTimestamp: '2020-11-18T16:45:56Z',
    managedFields: [
      {
        manager: 'argocd-server',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2020-11-20T19:28:06Z',
      },
      {
        manager: 'argocd-application-controller',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2021-01-07T08:38:15Z',
      },
    ],
  },
  spec: {
    source: {
      repoURL: 'https://github.com/argoproj/argocd-example-apps',
      path: 'guestbook',
      targetRevision: 'HEAD',
    },
    destination: {
      server: 'https://kubernetes.default.svc',
      namespace: 'default',
    },
    project: 'default',
  },
  status: {
    resources: [
      {
        version: 'v1',
        kind: 'Service',
        namespace: 'default',
        name: 'guestbook-ui',
        status: 'Synced',
        health: { status: 'Healthy' },
      },
      {
        group: 'apps',
        version: 'v1',
        kind: 'Deployment',
        namespace: 'default',
        name: 'guestbook-ui',
        status: 'Synced',
        health: { status: 'Healthy' },
      },
    ],
    sync: {
      status: 'Synced',
      comparedTo: {
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps',
          path: 'guestbook',
          targetRevision: 'HEAD',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'default',
        },
      },
      revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
    },
    health: { status: 'Healthy' },
    history: [
      {
        revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
        deployStartedAt: '2020-11-18T16:47:02Z',
        deployedAt: '2020-11-18T16:47:04Z',
        id: 0,
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps',
          path: 'guestbook',
          targetRevision: 'HEAD',
        },
      },
    ],
    reconciledAt: '2021-01-07T08:38:15Z',
    operationState: {
      operation: {
        sync: {
          revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
          syncStrategy: {},
        },
      },
      phase: 'Succeeded',
      message: 'successfully synced (all tasks run)',
      syncResult: {
        resources: [
          {
            group: '',
            version: 'v1',
            kind: 'Service',
            namespace: 'default',
            name: 'guestbook-ui',
            status: 'Synced',
            message: 'service/guestbook-ui created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: 'apps',
            version: 'v1',
            kind: 'Deployment',
            namespace: 'default',
            name: 'guestbook-ui',
            status: 'Synced',
            message: 'deployment.apps/guestbook-ui created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
        ],
        revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps',
          path: 'guestbook',
          targetRevision: 'HEAD',
        },
      },
      startedAt: '2020-11-18T16:47:03Z',
      finishedAt: '2020-11-18T16:47:04Z',
    },
    observedAt: '2021-01-07T08:38:15Z',
    sourceType: 'Directory',
    summary: { images: ['gcr.io/heptio-images/ks-guestbook-demo:0.2'] },
  },
};

export const getResponseStubScanning = {
  metadata: {
    name: 'guestbook',
    instance: { name: 'argoInstance1', url: 'https://test.com' },
    namespace: 'argocd',
    selfLink:
      '/apis/argoproj.io/v1alpha1/namespaces/argocd/applications/guestbook',
    uid: 'f959d66b-9ef2-4819-a1f2-f35874b61303',
    resourceVersion: '7277391',
    generation: 23872,
    creationTimestamp: '2020-11-18T16:45:56Z',
    managedFields: [
      {
        manager: 'argocd-server',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2020-11-20T19:28:06Z',
      },
      {
        manager: 'argocd-application-controller',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2021-01-07T08:38:15Z',
      },
    ],
  },
  spec: {
    source: {
      repoURL: 'https://github.com/argoproj/argocd-example-apps',
      path: 'guestbook',
      targetRevision: 'HEAD',
    },
    destination: {
      server: 'https://kubernetes.default.svc',
      namespace: 'default',
    },
    project: 'default',
  },
  status: {
    resources: [
      {
        version: 'v1',
        kind: 'Service',
        namespace: 'default',
        name: 'guestbook-ui',
        status: 'Synced',
        health: { status: 'Healthy' },
      },
      {
        group: 'apps',
        version: 'v1',
        kind: 'Deployment',
        namespace: 'default',
        name: 'guestbook-ui',
        status: 'Synced',
        health: { status: 'Healthy' },
      },
    ],
    sync: {
      status: 'Synced',
      comparedTo: {
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps',
          path: 'guestbook',
          targetRevision: 'HEAD',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'default',
        },
      },
      revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
    },
    health: { status: 'Healthy' },
    history: [
      {
        revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
        deployStartedAt: '2020-11-18T16:47:02Z',
        deployedAt: '2020-11-18T16:47:04Z',
        id: 0,
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps',
          path: 'guestbook',
          targetRevision: 'HEAD',
        },
      },
    ],
    reconciledAt: '2021-01-07T08:38:15Z',
    operationState: {
      operation: {
        sync: {
          revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
          syncStrategy: {},
        },
      },
      phase: 'Succeeded',
      message: 'successfully synced (all tasks run)',
      syncResult: {
        resources: [
          {
            group: '',
            version: 'v1',
            kind: 'Service',
            namespace: 'default',
            name: 'guestbook-ui',
            status: 'Synced',
            message: 'service/guestbook-ui created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: 'apps',
            version: 'v1',
            kind: 'Deployment',
            namespace: 'default',
            name: 'guestbook-ui',
            status: 'Synced',
            message: 'deployment.apps/guestbook-ui created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
        ],
        revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps',
          path: 'guestbook',
          targetRevision: 'HEAD',
        },
      },
      startedAt: '2020-11-18T16:47:03Z',
      finishedAt: '2020-11-18T16:47:04Z',
    },
    observedAt: '2021-01-07T08:38:15Z',
    sourceType: 'Directory',
    summary: { images: ['gcr.io/heptio-images/ks-guestbook-demo:0.2'] },
  },
};

export const getEmptyResponseStub = {
  metadata: {
    resourceVersion: '7277391'
  },
  items: null
};

export const getResponseStubAppListForInstanceOne = {
  metadata: {
    resourceVersion: '7277391'
  },
  items: [getResponseStubScanning,]
};


export const getResponseStubAppListForInstanceTwo = () => {
  const item = JSON.parse(JSON.stringify(getResponseStubScanning));
  item.metadata.instance.name = 'argoInstance2';
  return {
    metadata: {
      resourceVersion: '7277390'
    },
    items: [item,]
  };
};

export const multipleApps = () => {
  const item = JSON.parse(JSON.stringify(getResponseStubScanning));
  const item1 = JSON.parse(JSON.stringify(item));
  item1.metadata.name = 'guestbook-prod';
  const item2 = JSON.parse(JSON.stringify(item));
  item2.metadata.name = 'guestbook-staging';
  return [item1, item2];
};

export const getResponseStubAppListWithMultipleApps = {
  metadata: {
    resourceVersion: '7277391'
  },
  items: multipleApps()
};


export class ArgoCDApiMock implements ArgoCDApi {
  // @ts-ignore
  // constructor(_: Options) {}

  // @ts-ignore
  async listApps(_: { url: string; appSelector: string; }) {
    return {
      items: [
        {
          metadata: {
            name: 'guestbook-prod',
          },
          status: {
            sync: {
              status: 'Synced',
            },
            health: {
              status: 'Healthy',
            },
            operationState: {
              startedAt: '2020-11-18T16:47:03Z',
              finishedAt: '2020-11-18T16:47:04Z',
            },
          },
        },
        {
          metadata: {
            name: 'guestbook-staging',
          },
          status: {
            sync: {
              status: 'OutOfSync',
            },
            health: {
              status: 'Healthy',
            },
            operationState: {
              startedAt: '2020-11-18T16:47:03Z',
              finishedAt: '2020-11-18T16:47:04Z',
            },
          },
        },
      ],
    };
  }

  // @ts-ignore
  async getAppDetails(_: { appName: string; }) {
    return {
      metadata: {
        name: 'guestbook',
      },
      status: {
        sync: {
          status: 'Synced',
        },
        health: {
          status: 'Healthy',
        },
        operationState: {
          startedAt: '2020-11-18T16:47:03Z',
          finishedAt: '2020-11-18T16:47:04Z',
        },
      },
    };
  }
}

export const getIdentityApiStub: IdentityApi = {
  getProfileInfo: jest.fn(),
  getBackstageIdentity: jest.fn(),
  async getCredentials() {
    return {token: 'fake-id-token'}
  },
  signOut: jest.fn(),
};