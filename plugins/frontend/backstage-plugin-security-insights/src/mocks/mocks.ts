import { Entity } from '@backstage/catalog-model';

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

export const dependabotAlertsResponseMock = {
  repository: {
    vulnerabilityAlerts: {
      totalCount: 2,
      nodes: [
        {
          createdAt: "2020-10-13T14:05:11Z",
          id: "MDI4OlJlcddsdsfererertc5QWxlcnQ0MDgyODMyyy2MDY=",
          dismissedAt: null,
          vulnerableManifestPath: "yarn.lock",
          securityVulnerability: {
            vulnerableVersionRange: "< 3.1.0",
            package: {
              name: "serialize-javascript"
            },
            firstPatchedVersion: {
              "identifier": "3.1.0"
            },
            severity: "HIGH",
            advisory: {
              description: "serialize-javascript prior to 3.1.0 allows remote attackers to inject arbitrary code via the function \"deleteFunctions\" within \"index.js\". \r\n\r\nAn object such as `{\"foo\": /1\"/, \"bar\": \"a\\\"@__R-<UID>-0__@\"}` was serialized as `{\"foo\": /1\"/, \"bar\": \"a\\/1\"/}`, which allows an attacker to escape the `bar` key. This requires the attacker to control the values of both `foo` and `bar` and guess the value of `<UID>`. The UID has a keyspace of approximately 4 billion making it a realistic network attack.\r\n\r\nThe following proof-of-concept calls `console.log()` when the running `eval()`:\r\n`eval('('+ serialize({\"foo\": /1\" + console.log(1)/i, \"bar\": '\"@__R-<UID>-0__@'}) + ')');`"
            }
          }
        },
        {
          createdAt: "2021-05-25T15:16:23Z",
          id: "MDI4OlJlcG9zaXRvcnlWdWxuuuuuuZXJhYmls12lksoiurrrQ3MTE1NjQwODQ=",
          dismissedAt: null,
          vulnerableManifestPath: "yarn.lock",
          securityVulnerability: {
            vulnerableVersionRange: ">= 4.0.0, < 4.16.5",
            package: {
              name: "browserslist"
            },
            firstPatchedVersion: {
              identifier: "4.16.5"
            },
            severity: "MODERATE",
            advisory: {
              description: "The package browserslist from 4.0.0 and before 4.16.5 are vulnerable to Regular Expression Denial of Service (ReDoS) during parsing of queries."
            }
          }
        }
      ]
    }

  }
}

export const entityStub: { entity: Entity } = {
  entity: {
    metadata: {
      namespace: 'default',
      annotations: {
        'github.com/project-slug': 'roadiehq/sample-service',
        'backstage.io/managed-by-location': 'url:http://roadiehq/sample-service/blob/master/catalog-info.yaml'
      },
      name: 'sample-service',
      description: 'Sample service'
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    spec: {
      type: 'service',
      lifecycle: 'experimental',
    },
  },
};
