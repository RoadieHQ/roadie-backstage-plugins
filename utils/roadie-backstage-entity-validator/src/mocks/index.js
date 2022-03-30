export const memoryFileSystem = {
  'catalog-info-with-bad-techdocs-dir.yml': `
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: sample-service-5
  description: |
      A broken component
  annotations:
      backstage.io/techdocs-ref: dir:./
spec:
  type: service
  owner: user:dtuite
  lifecycle: experimental
  providesApis:
    - sample-service
`,
  'catalog-info-with-empty-label.yml': `
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: test-service-api
  description: API for test-service
spec:
  type: openapi
  lifecycle: production
  owner: group:team-atools
  definition:
`,
  'catalog-info-with-replacement.yml': `
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: test-service-api
  description: API for test-service
spec:
  type: openapi
  lifecycle: production
  owner: group:team-atools
  definition:
    $text: "./openapi/v1.oas3.yaml"
`,
  'catalog-info.yml': `
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: sample-service-5
  description: |
    A service for testing Backstage functionality. Configured for GitHub Actions, Sentry, AWS Lambda, Datadog and mis-configured techdocs.
  annotations:
    github.com/project-slug: roadiehq/sample-service
    sentry.io/project-slug: sample-service
    aws.com/lambda-function-name: HelloWorld
    aws.com/lambda-region: eu-west-1
    backstage.io/techdocs-ref: url:https://github.com/RoadieHQ/sample-service/tree/main
    jira/project-key: TEST
    jira/component: COMP
    snyk.io/org-name: roadie
    backstage.io/view-url: https://github.com/RoadieHQ/sample-service/tree/main
    backstage.io/source-location: url:https://github.com/RoadieHQ/sample-service/tree/main/
    testextraannotation: adfstea
    backstage.io/ldap-uuid: c57e8ba2-6cc4-1039-9ebc-d5f241a7ca21
spec:
    type: service
    owner: user:dtuite
    lifecycle: experimental
    providesApis:
      - sample-service

---

apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: sample-service-5
  description: |
      A service for testing Backstage functionality. Configured for GitHub Actions, Sentry, AWS Lambda, Datadog and mis-configured techdocs.
  annotations:
    github.com/project-slug: roadiehq/sample-service
    sentry.io/project-slug: sample-service
    aws.com/lambda-function-name: HelloWorld
    aws.com/lambda-region: eu-west-1
    backstage.io/techdocs-ref: url:https://github.com/RoadieHQ/sample-service/tree/main
    jira/project-key: TEST
    jira/component: COMP
    snyk.io/org-name: roadie
    backstage.io/view-url: https://github.com/RoadieHQ/sample-service/tree/main
    backstage.io/source-location: url:https://github.com/RoadieHQ/sample-service/tree/main/
    testextraannotation: adfstea
    backstage.io/ldap-uuid: c57e8ba2-6cc4-1039-9ebc-d5f241a7ca21
spec:
  type: service
  owner: user:dtuite
  lifecycle: experimental
  providesApis:
    - sample-service
`,
  'template-v2-entity.yml': `
apiVersion: backstage.io/v1beta2
kind: Template
metadata:
    name: sample-template-v2
spec:
  type: foo
  steps:
  - id: zip
    name: Zip
    action: roadiehq:utils:zip
    input:
      path: foo.txt
      outputPath: foo.zip
    `,
  'template-v3-entity.yml': `
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: sample-template-v3
spec:
  type: foo
  steps:
  - id: zip
    name: Zip
    action: roadiehq:utils:zip
    input:
      path: foo.txt
      outputPath: foo.zip
`,
};
