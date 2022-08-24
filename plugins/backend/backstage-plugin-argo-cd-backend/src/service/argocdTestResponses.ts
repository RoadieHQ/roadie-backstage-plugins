export const argocdCreateProjectResp = {
  metadata: {
    name: 'backstagemanual',
    namespace: 'argocd',
    uid: '28abfcbd-d5f1-4964-87a0-1465acfc40c8',
    resourceVersion: '261555539',
    generation: 1,
    creationTimestamp: '2022-04-12T15:37:14Z',
    managedFields: [
      {
        manager: 'argocd-server',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2022-04-12T15:37:14Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:spec': {
            '.': {},
            'f:destinations': {},
            'f:sourceRepos': {},
          },
          'f:status': {},
        },
      },
    ],
  },
  spec: {
    sourceRepos: ['https://github.com/backstage/backstage.git'],
    destinations: [
      {
        server: 'https://kubernetes.default.svc',
        namespace: 'backstagemanual',
        name: 'local',
      },
    ],
  },
  status: {},
};

export const argocdCreateApplicationResp = {
  metadata: {
    name: 'backstagemanual',
    namespace: 'argocd',
    uid: 'f6c99324-fb24-4760-ad1c-2260d0ce3aa1',
    resourceVersion: '261571810',
    generation: 1,
    creationTimestamp: '2022-04-12T15:47:03Z',
    labels: {
      'backstage-name': 'backstagemanual',
    },
    finalizers: ['resources-finalizer.argocd.argoproj.io'],
    managedFields: [
      {
        manager: 'argocd-server',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2022-04-12T15:47:03Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:finalizers': {
              '.': {},
              'v:"resources-finalizer.argocd.argoproj.io"': {},
            },
            'f:labels': {
              '.': {},
              'f:backstage-name': {},
            },
          },
          'f:spec': {
            '.': {},
            'f:destination': {
              '.': {},
              'f:namespace': {},
              'f:server': {},
            },
            'f:project': {},
            'f:revisionHistoryLimit': {},
            'f:source': {
              '.': {},
              'f:path': {},
              'f:repoURL': {},
            },
            'f:syncPolicy': {
              '.': {},
              'f:automated': {
                '.': {},
                'f:allowEmpty': {},
                'f:prune': {},
                'f:selfHeal': {},
              },
              'f:retry': {
                '.': {},
                'f:backoff': {
                  '.': {},
                  'f:duration': {},
                  'f:factor': {},
                  'f:maxDuration': {},
                },
                'f:limit': {},
              },
              'f:syncOptions': {},
            },
          },
          'f:status': {
            '.': {},
            'f:health': {},
            'f:summary': {},
            'f:sync': {
              '.': {},
              'f:comparedTo': {
                '.': {},
                'f:destination': {},
                'f:source': {
                  '.': {},
                  'f:repoURL': {},
                },
              },
              'f:status': {},
            },
          },
        },
      },
    ],
  },
  spec: {
    source: {
      repoURL: 'https://github.com/backstage/backstage20220408139.git',
      path: 'k8s/nonprod',
    },
    destination: {
      server: 'https://kubernetes.default.svc',
      namespace: 'backstagemanual',
    },
    project: 'backstagemanual',
    syncPolicy: {
      automated: {
        prune: true,
        selfHeal: true,
        allowEmpty: true,
      },
      syncOptions: ['CreateNamespace=false'],
      retry: {
        limit: 10,
        backoff: {
          duration: '5s',
          factor: 2,
          maxDuration: '5m',
        },
      },
    },
    revisionHistoryLimit: 10,
  },
  status: {
    sync: {
      status: '',
      comparedTo: {
        source: {
          repoURL: '',
        },
        destination: {},
      },
    },
    health: {},
    summary: {},
  },
};

export const syncResp = {
  metadata: {
    name: 'backstage20220408139-nonprod',
    namespace: 'argocd',
    uid: '1376f30f-14fc-4847-a165-577d3e0ecce7',
    resourceVersion: '120479338',
    generation: 1924,
    creationTimestamp: '2022-04-08T17:40:47Z',
    labels: {
      'backstage-name': 'backstage20220408139',
    },
    finalizers: ['resources-finalizer.argocd.argoproj.io'],
    managedFields: [
      {
        manager: 'argocd-application-controller',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2022-04-12T13:31:19Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:status': {
            'f:health': {
              'f:status': {},
            },
            'f:history': {},
            'f:reconciledAt': {},
            'f:resources': {},
            'f:sourceType': {},
            'f:summary': {
              'f:externalURLs': {},
              'f:images': {},
            },
            'f:sync': {
              'f:comparedTo': {
                'f:destination': {
                  'f:namespace': {},
                  'f:server': {},
                },
                'f:source': {
                  'f:path': {},
                  'f:repoURL': {},
                },
              },
              'f:revision': {},
              'f:status': {},
            },
          },
        },
      },
      {
        manager: 'argocd-server',
        operation: 'Update',
        apiVersion: 'argoproj.io/v1alpha1',
        time: '2022-04-12T15:54:28Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:finalizers': {
              '.': {},
              'v:"resources-finalizer.argocd.argoproj.io"': {},
            },
            'f:labels': {
              '.': {},
              'f:backstage-name': {},
            },
          },
          'f:operation': {
            '.': {},
            'f:initiatedBy': {
              '.': {},
              'f:username': {},
            },
            'f:retry': {
              '.': {},
              'f:backoff': {
                '.': {},
                'f:duration': {},
                'f:factor': {},
                'f:maxDuration': {},
              },
              'f:limit': {},
            },
            'f:sync': {
              '.': {},
              'f:revision': {},
              'f:syncOptions': {},
              'f:syncStrategy': {
                '.': {},
                'f:hook': {
                  '.': {},
                  'f:force': {},
                },
              },
            },
          },
          'f:spec': {
            '.': {},
            'f:destination': {
              '.': {},
              'f:namespace': {},
              'f:server': {},
            },
            'f:project': {},
            'f:revisionHistoryLimit': {},
            'f:source': {
              '.': {},
              'f:path': {},
              'f:repoURL': {},
            },
            'f:syncPolicy': {
              '.': {},
              'f:automated': {
                '.': {},
                'f:allowEmpty': {},
                'f:prune': {},
                'f:selfHeal': {},
              },
              'f:retry': {
                '.': {},
                'f:backoff': {
                  '.': {},
                  'f:duration': {},
                  'f:factor': {},
                  'f:maxDuration': {},
                },
                'f:limit': {},
              },
              'f:syncOptions': {},
            },
          },
          'f:status': {
            '.': {},
            'f:health': {},
            'f:summary': {},
            'f:sync': {
              '.': {},
              'f:comparedTo': {
                '.': {},
                'f:destination': {},
                'f:source': {},
              },
            },
          },
        },
      },
    ],
  },
  spec: {
    source: {
      repoURL: 'https://github.com/backstage/backstage20220408139.git',
      path: 'k8s/nonprod',
    },
    destination: {
      server: 'https://kubernetes.default.svc',
      namespace: 'testnamespace',
    },
    project: 'backstage20220408139-nonprod',
    syncPolicy: {
      automated: {
        prune: true,
        selfHeal: true,
        allowEmpty: true,
      },
      syncOptions: ['CreateNamespace=false'],
      retry: {
        limit: 10,
        backoff: {
          duration: '5s',
          factor: 2,
          maxDuration: '5m',
        },
      },
    },
    revisionHistoryLimit: 10,
  },
  status: {
    resources: [
      {
        group: 'test.test.com',
        version: 'v1alpha1',
        kind: 'WebApp',
        namespace: 'testnamespace',
        name: 'backstage20220408139-nonprod',
        status: 'Synced',
      },
    ],
    sync: {
      status: 'Synced',
      comparedTo: {
        source: {
          repoURL: 'https://github.com/backstage/backstage20220408139.git',
          path: 'k8s/nonprod',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'testnamespace',
        },
      },
      revision: '38554e11dbe1d68790c9f0567eaf31dedd4c3638',
    },
    health: {
      status: 'Healthy',
    },
    history: [
      {
        revision: '38554e11dbe1d68790c9f0567eaf31dedd4c3638',
        deployedAt: '2022-04-08T17:40:49Z',
        id: 0,
        source: {
          repoURL: 'https://github.com/backstage/backstage20220408139.git',
          path: 'k8s/nonprod',
        },
        deployStartedAt: '2022-04-08T17:40:47Z',
      },
      {
        revision: '38554e11dbe1d68790c9f0567eaf31dedd4c3638',
        deployedAt: '2022-04-12T13:28:46Z',
        id: 1,
        source: {
          repoURL: 'https://github.com/backstage/backstage20220408139.git',
          path: 'k8s/nonprod',
        },
        deployStartedAt: '2022-04-12T13:28:43Z',
      },
    ],
    reconciledAt: '2022-04-12T15:54:24Z',
    sourceType: 'Directory',
    summary: {
      externalURLs: ['http://backstage20220408139-nonprod.cloud.test.com/'],
      images: [
        'docker.io/kumahq/kuma-dp:1.3.1',
        'docker.io/kumahq/kuma-init:1.3.1',
        'packages.test.com/docker-dev/backstage20220408139:0.0.1',
      ],
    },
  },
  operation: {
    sync: {
      revision: '38554e11dbe1d68790c9f0567eaf31dedd4c3638',
      syncStrategy: {
        hook: {
          force: true,
        },
      },
      syncOptions: ['CreateNamespace=false'],
    },
    initiatedBy: {
      username: 'testnamespace',
    },
    retry: {
      limit: 10,
      backoff: {
        duration: '5s',
        factor: 2,
        maxDuration: '5m',
      },
    },
  },
};
