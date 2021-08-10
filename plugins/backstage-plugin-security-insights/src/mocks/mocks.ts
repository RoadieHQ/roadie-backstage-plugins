export const entityMock = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/mcalus3/sample-service/blob/master/backstage5.yaml',
      'github.com/project-slug': 'mcalus3/backstage',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: '6cba1a89-c10e-4705-8c81-07c81fcb8a89',
    etag: 'ODkyMzAzMzgtM2I3MC00MjhhLWEwOWMtMWI1N2E0YjFkNDVj',
    generation: 1,
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  spec: {
    type: 'service',
    owner: 'david@roadie.io',
    lifecycle: 'experimental',
  },
  relations: [
    {
      target: { kind: 'group', namespace: 'default', name: 'david@roadie.io' },
      type: 'ownedBy',
    },
  ],
};

export const alertsResponseMock = [
  {
    number: 8,
    created_at: '2021-01-11T13:09:12Z',
    url:
      'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts/8',
    html_url: 'https://github.com/mcalus3/backstage/security/code-scanning/8',
    state: 'open',
    dismissed_by: null,
    dismissed_at: null,
    dismissed_reason: null,
    rule: {
      id: 'js/incomplete-sanitization',
      severity: 'warning',
      description: 'Incomplete string escaping or encoding',
    },
    tool: {
      name: 'CodeQL',
      version: null,
    },
  },
  {
    number: 7,
    created_at: '2021-01-11T13:09:12Z',
    url:
      'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts/7',
    html_url: 'https://github.com/mcalus3/backstage/security/code-scanning/7',
    state: 'open',
    dismissed_by: null,
    dismissed_at: null,
    dismissed_reason: null,
    rule: {
      id: 'js/hardcoded-credentials',
      severity: 'warning',
      description: 'Hard-coded credentials',
    },
    tool: {
      name: 'CodeQL',
      version: null,
    },
  },
  {
    number: 6,
    created_at: '2021-01-11T13:09:12Z',
    url:
      'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts/6',
    html_url: 'https://github.com/mcalus3/backstage/security/code-scanning/6',
    state: 'open',
    dismissed_by: null,
    dismissed_at: null,
    dismissed_reason: null,
    rule: {
      id: 'js/hardcoded-credentials',
      severity: 'warning',
      description: 'Hard-coded credentials',
    },
    tool: {
      name: 'CodeQL',
      version: null,
    },
  },
  {
    number: 5,
    created_at: '2021-01-11T13:09:12Z',
    url:
      'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts/5',
    html_url: 'https://github.com/mcalus3/backstage/security/code-scanning/5',
    state: 'open',
    dismissed_by: null,
    dismissed_at: null,
    dismissed_reason: null,
    rule: {
      id: 'js/hardcoded-credentials',
      severity: 'warning',
      description: 'Hard-coded credentials',
    },
    tool: {
      name: 'CodeQL',
      version: null,
    },
  },
  {
    number: 4,
    created_at: '2021-01-11T13:09:12Z',
    url:
      'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts/4',
    html_url: 'https://github.com/mcalus3/backstage/security/code-scanning/4',
    state: 'open',
    dismissed_by: null,
    dismissed_at: null,
    dismissed_reason: null,
    rule: {
      id: 'js/hardcoded-credentials',
      severity: 'warning',
      description: 'Hard-coded credentials',
    },
    tool: {
      name: 'CodeQL',
      version: null,
    },
  },
  {
    number: 3,
    created_at: '2021-01-11T13:09:12Z',
    url:
      'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts/3',
    html_url: 'https://github.com/mcalus3/backstage/security/code-scanning/3',
    state: 'open',
    dismissed_by: null,
    dismissed_at: null,
    dismissed_reason: null,
    rule: {
      id: 'js/hardcoded-credentials',
      severity: 'warning',
      description: 'Hard-coded credentials',
    },
    tool: {
      name: 'CodeQL',
      version: null,
    },
  },
  {
    number: 2,
    created_at: '2021-01-11T13:09:12Z',
    url:
      'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts/2',
    html_url: 'https://github.com/mcalus3/backstage/security/code-scanning/2',
    state: 'open',
    dismissed_by: null,
    dismissed_at: null,
    dismissed_reason: null,
    rule: {
      id: 'js/hardcoded-credentials',
      severity: 'warning',
      description: 'Hard-coded credentials',
    },
    tool: {
      name: 'CodeQL',
      version: null,
    },
  },
  {
    number: 1,
    created_at: '2021-01-11T13:09:12Z',
    url:
      'https://api.github.com/repos/mcalus3/backstage/code-scanning/alerts/1',
    html_url: 'https://github.com/mcalus3/backstage/security/code-scanning/1',
    state: 'open',
    dismissed_by: null,
    dismissed_at: null,
    dismissed_reason: null,
    rule: {
      id: 'js/hardcoded-credentials',
      severity: 'warning',
      description: 'Hard-coded credentials',
    },
    tool: {
      name: 'CodeQL',
      version: null,
    },
  },
];
