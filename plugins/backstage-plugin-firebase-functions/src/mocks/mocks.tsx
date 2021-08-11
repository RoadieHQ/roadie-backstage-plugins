import { Entity } from '@backstage/catalog-model';

export const entityMock: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    annotations: {
      'backstage.io/managed-by-location':
        'github:https://github.com/mcalus3/sample-service/blob/master/backstage.yaml',
      'circleci.com/project-slug': 'RoadieHQ/sample-service',
      'github.com/project-slug': 'RoadieHQ/sample-service',
      'backstage.io/github-actions-id': 'RoadieHQ/sample-service',
      'cloud.google.com/function-ids':
        'projects/backstage-test-project/locations/us-central1/functions/helloMarek',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: 'b47ae42c-2a18-41bb-b21b-9310adccb9f3',
    etag: 'OGE4MzJiNWQtNzM0OC00ZmExLTgzNjItNjljZDlkZDNmMTY4',
    generation: 1,
  },
  spec: {
    type: 'service',
    owner: 'david@roadie.io',
    lifecycle: 'experimental',
  },
};

export const entityMockMultipleFunctions: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    annotations: {
      'backstage.io/managed-by-location':
        'github:https://github.com/mcalus3/sample-service/blob/master/backstage.yaml',
      'circleci.com/project-slug': 'RoadieHQ/sample-service',
      'github.com/project-slug': 'RoadieHQ/sample-service',
      'backstage.io/github-actions-id': 'RoadieHQ/sample-service',
      'cloud.google.com/function-ids':
        'projects/backstage-test-project/locations/us-central1/functions/helloMarek,projects/backstage-test-project/locations/us-central1/functions/helloWorld,projects/backstage-test-project2/locations/us-central1/functions/helloMarek,projects/backstage-test-project2/locations/us-central1/functions/helloWorld',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: 'b47ae42c-2a18-41bb-b21b-9310adccb9f3',
    etag: 'OGE4MzJiNWQtNzM0OC00ZmExLTgzNjItNjljZDlkZDNmMTY4',
    generation: 1,
  },
  spec: {
    type: 'service',
    owner: 'david@roadie.io',
    lifecycle: 'experimental',
  },
};

export const functionDataMock = {
  name:
    'projects/backstage-test-project/locations/us-central1/functions/helloMarek',
  httpsTrigger: {
    url:
      'https://us-central1-backstage-test-project.cloudfunctions.net/helloMarek',
  },
  status: 'ACTIVE',
  updateTime: '2020-09-04T09:08:15.967Z',
  runtime: 'nodejs10',
  availableMemoryMb: 256,
  project: 'backstage-test-project',
  region: 'us-central1',
  labels: {
    'deployment-tool': 'cli-firebase',
  },
  environmentVariables: {
    FIREBASE_CONFIG:
      '{"projectId":"backstage-test-project","databaseURL":"https://backstage-test-project.firebaseio.com","storageBucket":"backstage-test-project.appspot.com"}',
  },
  tableData: {
    id: 0,
  },
};
