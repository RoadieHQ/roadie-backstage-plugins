export const getEntityStub = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/mcalus3/sample-service/blob/master/backstage.yaml',
      'datadog/dashboard-url':
        'https://p.datadoghq.eu/sb/0btd7eqqecs1876r-bffe383395de51ae6fe70257da1e547f?from_ts=1612163170556&to_ts=1612166770556&live=true',
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
