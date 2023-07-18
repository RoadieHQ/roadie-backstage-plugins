jest.mock('fs');
const validator = require('./validator');
const { vol } = require('memfs');

describe('validator', () => {
  beforeEach(() => {
    vol.reset();
    vol.fromJSON({
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
      'catalog-info-with-openapi-placeholder.yml': `
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
    $openapi: "./openapi/v1.oas3.yaml"
`,
      'catalog-info-with-asyncapi-placeholder.yml': `
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
    $asyncapi: "./asyncapi/some-spec.yaml"
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
      'catalog-info-with-custom-fields.yml': `
    apiVersion: backstage.io/v1alpha1
    kind: Component
    metadata:
      name: sample-service-5
      description: |
        A service for testing Backstage functionality. Configured for GitHub Actions, Sentry, AWS Lambda, Datadog and mis-configured techdocs.
      annotations:
        github.com/project-slug: roadiehq/sample-service
        backstage.io/view-url: https://github.com/RoadieHQ/sample-service/tree/main
        backstage.io/source-location: url:https://github.com/RoadieHQ/sample-service/tree/main/
        custom/source-location: custom-field-value:12342
    spec:
        type: service
        owner: user:dtuite
        lifecycle: experimental
`,
      'catalog-info-with-custom-fields-with-errors.yml': `
        apiVersion: backstage.io/v1alpha1
        kind: Component
        metadata:
          name: sample-service-5
          description: |
            A service for testing Backstage functionality. Configured for GitHub Actions, Sentry, AWS Lambda, Datadog and mis-configured techdocs.
          annotations:
            github.com/project-slug: roadiehq/sample-service
            backstage.io/view-url: https://github.com/RoadieHQ/sample-service/tree/main
            backstage.io/source-location: url:https://github.com/RoadieHQ/sample-service/tree/main/
            custom/source-location: custom-field-value:123error
        spec:
            type: service
            owner: user:dtuite
            lifecycle: experimental
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
      'custom-validation-schema.json': `
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "Custom Entity metadata annotations",
  "description": "Individual annotation format validations",
  "type": "object",
  "required": ["metadata"],
  "additionalProperties": true,
  "properties": {
    "metadata": {
      "type": "object",
      "properties": {
        "annotations": {
          "type": "object",
          "allOf": [
            {
              "properties": {
                "custom/source-location": {
                  "type": "string",
                  "pattern": "^custom-field-value:\\\\d*$"
                }
              }
            }
          ]
        }
      }
    }
  }
}`,
    });
  });
  afterEach(() => {
    vol.reset();
  });
  it('Should successfully validate simple catalog info', async () => {
    await expect(
      validator.validateFromFile('catalog-info.yml'),
    ).resolves.toBeUndefined();
  });

  it('Should fail to validate with incorrect catalog-info', async () => {
    await expect(
      validator.validateFromFile('invalid-catalog-info.yml'),
    ).rejects.toThrow();
  });

  it('Should successfully validate catalog info with replacements', async () => {
    await expect(
      validator.validateFromFile('catalog-info-with-replacement.yml'),
    ).resolves.toBeUndefined();
    await expect(
      validator.validateFromFile('catalog-info-with-openapi-placeholder.yml'),
    ).resolves.toBeUndefined();
    await expect(
      validator.validateFromFile('catalog-info-with-asyncapi-placeholder.yml'),
    ).resolves.toBeUndefined();
  });

  it('Should fail to validate with incorrect catalog-info that has an empty label', async () => {
    await expect(
      validator.validateFromFile('catalog-info-with-empty-label.yml'),
    ).rejects.toThrow(
      "Error: Placeholder with name 'definition' is empty. Please remove it or populate it.",
    );
  });
  it('Should fail to validate with bad techdocs path', async () => {
    await expect(
      validator.validateFromFile('catalog-info-with-bad-techdocs-dir.yml'),
    ).rejects.toThrow('Techdocs annotation specifies "dir" but file under');
  });
  it('Should throw validation error for system entity', async () => {
    await expect(
      validator.validateFromFile('invalid-system-entity.yml'),
    ).rejects.toThrow();
  });
  it('Should throw validation error for domain entity', async () => {
    await expect(
      validator.validateFromFile('invalid-domain-entity.yml'),
    ).rejects.toThrow();
  });
  it('Should throw validation error for resource entity', async () => {
    await expect(
      validator.validateFromFile('invalid-resource-entity.yml'),
    ).rejects.toThrow();
  });
  describe('validateDefaultTechDocs', () => {
    const defaultVol = {
      './test-entity.yaml': `
      apiVersion: backstage.io/v1alpha1
      kind: Component
      metadata:
        name: test-entity
        description: |
          Foo bar description
        annotations:
          backstage.io/techdocs-ref: dir:.
      spec:
        type: service
        owner: user:dtuite
        lifecycle: experimental
      `,
    };
    describe('default techdocs annotations is set', () => {
      it('should use the default mkdocs.yaml', async () => {
        vol.fromJSON(defaultVol);
        await expect(
          validator.validateFromFile('./test-entity.yaml'),
        ).resolves.toBeUndefined();
      });
    });
  });
  describe('validateTechDocs', () => {
    const defaultVol = {
      './test-entity.yaml': `
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: test-entity
  description: |
    Foo bar description
  annotations:
    backstage.io/techdocs-ref: dir:test-dir
spec:
  type: service
  owner: user:dtuite
  lifecycle: experimental
`,
    };
    describe('techdocs annotation is set', () => {
      it('should throw error when mkdocs.yaml|mkdocs.yml file does not accessible', async () => {
        vol.fromJSON(defaultVol);
        await expect(
          validator.validateFromFile('./test-entity.yaml'),
        ).rejects.toThrow('test-dir/mkdocs.yaml');
      });

      it('should resolve when mkdocs.yaml found', async () => {
        vol.fromJSON({ ...defaultVol, 'test-dir/mkdocs.yaml': 'bar' });
        await expect(
          validator.validateFromFile('./test-entity.yaml'),
        ).resolves.toBeUndefined();
      });
      it('should resolve when mkdocs.yml found', async () => {
        vol.fromJSON({ ...defaultVol, 'test-dir/mkdocs.yml': 'bar' });
        await expect(
          validator.validateFromFile('./test-entity.yaml'),
        ).resolves.toBeUndefined();
      });
    });
  });
  describe('template', () => {
    it('Should successfully validate v2 template', async () => {
      await expect(
        validator.validateFromFile('template-v2-entity.yml'),
      ).resolves.toBeUndefined();
    });

    it('Should successfully validate v3 template', async () => {
      await expect(
        validator.validateFromFile('template-v3-entity.yml'),
      ).resolves.toBeUndefined();
    });
  });

  describe('customValidationSchema', () => {
    it('should successfully validate against custom annotation schema', async () => {
      await expect(
        validator.validateFromFile(
          'catalog-info-with-custom-fields.yml',
          false,
          'custom-validation-schema.json',
        ),
      ).resolves.toBeUndefined();
    });

    it('should throw validate error when validating against custom annotation schema', async () => {
      await expect(
        validator.validateFromFile(
          'catalog-info-with-custom-fields-with-errors.yml',
          false,
          'custom-validation-schema.json',
        ),
      ).rejects.toThrowError(
        'Error: Malformed annotation, /metadata/annotations/custom~1source-location must match pattern "^custom-field-value:\\d*$"',
      );
    });
  });
});
