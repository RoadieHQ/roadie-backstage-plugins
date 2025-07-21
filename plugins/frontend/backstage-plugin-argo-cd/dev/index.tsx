import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { ArgoCDApi, argoCDApiRef } from '../src/api';
import { ConfigReader } from '@backstage/core-app-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { EntityArgoCDHistoryCard, argocdPlugin } from '../src/plugin';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'argocd/app-name': 'guestbook',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export class MockArgoCDApiClient implements ArgoCDApi {
  readonly components;

  constructor(components: any) {
    this.components = components;
  }

  async listApps(_options: any): Promise<any> {
    return { items: [{}] };
  }

  async getRevisionDetails(_options: any): Promise<any> {
    return {
      author: 'Suzane',
      date: '2023-10-10T05:28:38Z',
      message: 'successful',
    };
  }

  async getAppDetails(_options: any): Promise<any> {
    return this.components;
  }
  async getAppListDetails(_options: any): Promise<any> {
    return {
      url: 'https://github.com/argoproj/argocd-example-apps.git',
      appSelector: 'hkhk',
      instance: 'hhiyi',
    };
  }

  async serviceLocatorUrl(options: { appName?: string }): Promise<any> {
    return [
      {
        name: 'argocdinstance',
        url: 'https://github.com/argoproj/argocd-example-apps.git',
        appName: options.appName,
      },
    ];
  }
}

const mockArgoCDClient = {
  metadata: {
    name: 'guestbook',
    namespace: 'argocd',
    uid: '3c948668-090a-4cf7-a9a6-8a944abf8676',
    resourceVersion: '1150262',
    generation: 696,
    creationTimestamp: '2023-10-10T05:28:13Z',
    managedFields: [
      {
        manager: 'argocd-server',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2023-10-10T17:37:31Z',
      },
      {
        manager: 'argocd-application-controller',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2023-10-12T12:48:14Z',
      },
    ],
  },
  spec: {
    source: {
      repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
      path: 'kustomize-guestbook',
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
        name: 'kustomize-guestbook-ui',
        status: 'Synced',
        health: {
          status: 'Healthy',
        },
      },
      {
        group: 'apps',
        version: 'v1',
        kind: 'Deployment',
        namespace: 'default',
        name: 'kustomize-guestbook-ui',
        status: 'Synced',
        health: {
          status: 'Healthy',
        },
      },
    ],
    sync: {
      status: 'Synced',
      comparedTo: {
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
          path: 'kustomize-guestbook',
          targetRevision: 'HEAD',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'default',
        },
      },
      revision: '53e28ff20cc530b9ada2173fbbd64d48338583ba',
    },
    health: {
      status: 'Healthy',
    },
    history: [
      {
        revision: '53e28ff20cc530b9ada2173fbbd64d48338583ba',
        deployedAt: '2023-10-10T05:28:38Z',
        id: 0,
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
          path: 'kustomize-guestbook',
          targetRevision: 'HEAD',
        },
        deployStartedAt: '2023-10-10T05:28:38Z',
      },
      {
        revision: '53e28ff20cc530b9ada2173fbbd6jd48338583bx',
        deployedAt: '2023-10-10T17:37:31Z',
        id: 1,
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
          path: 'kustomize-guestbook',
          targetRevision: 'HEAD',
        },
        deployStartedAt: '2023-10-10T17:37:31Z',
      },
      {
        revision: '53e28ff20cc530b9ada2173fbbd64d48338589bx',
        deployedAt: '2023-10-09T17:37:31Z',
        id: 2,
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
          path: 'kustomize-guestbook',
          targetRevision: 'HEAD',
        },
        deployStartedAt: '2023-10-10T17:37:31Z',
      },
    ],
    reconciledAt: '2023-10-12T12:48:14Z',
    operationState: {
      operation: {
        sync: {
          revision: '53e28ff20cc530b9ada2173fbbd64d48338583ba',
          syncStrategy: {
            hook: {},
          },
          syncOptions: ['CreateNamespace=true'],
        },
        initiatedBy: {
          username: 'admin',
        },
        retry: {},
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
            name: 'kustomize-guestbook-ui',
            status: 'Synced',
            message: 'service/kustomize-guestbook-ui unchanged',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: 'apps',
            version: 'v1',
            kind: 'Deployment',
            namespace: 'default',
            name: 'kustomize-guestbook-ui',
            status: 'Synced',
            message: 'deployment.apps/kustomize-guestbook-ui unchanged',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
        ],
        revision: '53e28ff20cc530b9ada2173fbbd64d48338583ba',
        source: {
          repoURL: 'https://github.com/argoproj/argocd-example-apps.git',
          path: 'kustomize-guestbook',
          targetRevision: 'HEAD',
        },
      },
      startedAt: '2023-10-10T17:37:31Z',
      finishedAt: '2023-10-10T17:37:31Z',
    },
    sourceType: 'Kustomize',
    summary: {
      images: ['gcr.io/heptio-images/ks-guestbook-demo:0.1'],
    },
    controllerNamespace: 'argocd',
  },
};

createDevApp()
  .registerPlugin(argocdPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new ConfigReader({
              argocd: {
                baseUrl: 'https://localhost:8080',
                username: 'argocd-account',
                password: 'argocd-pass',
                appLocatorMethods: [
                  {
                    type: 'config',
                    instances: [
                      {
                        name: 'argoInstance1',
                        url: 'https://openshift-gitops-server-openshift-gitops.apps.rhamilto.devcluster.openshift.com/',
                        token: 'jgjgj',
                      },
                      {
                        name: 'argoInstance2',
                        url: 'https://openshift-gitops-server-openshift-gitops.apps.rhamilto.devcluster.openshift.com/',
                        token: 'guytiuyjh',
                      },
                    ],
                  },
                ],
              },
            }),
          ],
          [argoCDApiRef, new MockArgoCDApiClient(mockArgoCDClient)],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityArgoCDHistoryCard />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'ArgoCD history',
    path: '/argocd',
  })
  .render();
