jest.mock('fs', () => {
  return require('memfs');
});
const validator = require('./validator');
const { vol } = require('memfs');

describe('validator', () => {
  beforeEach(() => {
    vol.reset();
    vol.fromJSON({
      'catalog-info-with-bad-techdocs-dir.yaml': `
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
      'catalog-info-with-empty-label.yaml': `
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
      'catalog-info-with-replacement.yaml': `
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
      'catalog-info-with-openapi-placeholder.yaml': `
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
      'catalog-info-with-asyncapi-placeholder.yaml': `
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
      'catalog-info.yaml': `
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
      'catalog-info-with-date-annotation.yaml': `
---

apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: sample-service-6
  annotations:
    annotation-with-date-like-value: 1955-11-05
spec:
  type: service
  owner: group:team-atools
  lifecycle: experimental
`,
      'catalog-info-with-custom-fields.yaml': `
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
      'catalog-info-with-custom-fields-with-errors.yaml': `
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
      'template-v2-entity.yaml': `
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
      'template-v3-entity.yaml': `
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
  beforeAll(() => {
    jest.clearAllMocks();
    vol.reset();
  });
  afterEach(() => {
    vol.reset();
  });
  afterAll(() => {
    jest.clearAllMocks();
    vol.reset();
  });
  it('Should successfully validate simple catalog info', async () => {
    await expect(
      validator.validateFromFile('catalog-info.yaml'),
    ).resolves.toEqual([
      {
        metadata: {
          namespace: 'default',
          name: 'sample-service-5',
          description:
            'A service for testing Backstage functionality. Configured for GitHub Actions, Sentry, AWS Lambda, Datadog and mis-configured techdocs.\n',
          annotations: {
            'github.com/project-slug': 'roadiehq/sample-service',
            'sentry.io/project-slug': 'sample-service',
            'aws.com/lambda-function-name': 'HelloWorld',
            'aws.com/lambda-region': 'eu-west-1',
            'backstage.io/techdocs-ref':
              'url:https://github.com/RoadieHQ/sample-service/tree/main',
            'jira/project-key': 'TEST',
            'jira/component': 'COMP',
            'snyk.io/org-name': 'roadie',
            'backstage.io/view-url':
              'https://github.com/RoadieHQ/sample-service/tree/main',
            'backstage.io/source-location':
              'url:https://github.com/RoadieHQ/sample-service/tree/main/',
            testextraannotation: 'adfstea',
            'backstage.io/ldap-uuid': 'c57e8ba2-6cc4-1039-9ebc-d5f241a7ca21',
          },
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        spec: {
          type: 'service',
          owner: 'user:dtuite',
          lifecycle: 'experimental',
          providesApis: ['sample-service'],
        },
      },
      {
        metadata: {
          namespace: 'default',
          name: 'sample-service-5',
          description:
            'A service for testing Backstage functionality. Configured for GitHub Actions, Sentry, AWS Lambda, Datadog and mis-configured techdocs.\n',
          annotations: {
            'github.com/project-slug': 'roadiehq/sample-service',
            'sentry.io/project-slug': 'sample-service',
            'aws.com/lambda-function-name': 'HelloWorld',
            'aws.com/lambda-region': 'eu-west-1',
            'backstage.io/techdocs-ref':
              'url:https://github.com/RoadieHQ/sample-service/tree/main',
            'jira/project-key': 'TEST',
            'jira/component': 'COMP',
            'snyk.io/org-name': 'roadie',
            'backstage.io/view-url':
              'https://github.com/RoadieHQ/sample-service/tree/main',
            'backstage.io/source-location':
              'url:https://github.com/RoadieHQ/sample-service/tree/main/',
            testextraannotation: 'adfstea',
            'backstage.io/ldap-uuid': 'c57e8ba2-6cc4-1039-9ebc-d5f241a7ca21',
          },
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        spec: {
          type: 'service',
          owner: 'user:dtuite',
          lifecycle: 'experimental',
          providesApis: ['sample-service'],
        },
      },
    ]);
  });

  it('Should fail to validate with incorrect catalog-info', async () => {
    await expect(
      validator.validateFromFile('invalid-catalog-info.yaml'),
    ).rejects.toThrow();
  });

  it('Should successfully validate catalog info with replacements', async () => {
    await expect(
      validator.validateFromFile('catalog-info-with-replacement.yaml'),
    ).resolves.toEqual([
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          namespace: 'default',
          name: 'test-service-api',
          description: 'API for test-service',
        },
        spec: {
          type: 'openapi',
          lifecycle: 'production',
          owner: 'group:team-atools',
          definition: 'DUMMY TEXT',
        },
      },
    ]);
    await expect(
      validator.validateFromFile('catalog-info-with-openapi-placeholder.yaml'),
    ).resolves.toEqual([
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          namespace: 'default',
          name: 'test-service-api',
          description: 'API for test-service',
        },
        spec: {
          type: 'openapi',
          lifecycle: 'production',
          owner: 'group:team-atools',
          definition: 'DUMMY TEXT',
        },
      },
    ]);
    await expect(
      validator.validateFromFile('catalog-info-with-asyncapi-placeholder.yaml'),
    ).resolves.toEqual([
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          namespace: 'default',
          name: 'test-service-api',
          description: 'API for test-service',
        },
        spec: {
          type: 'openapi',
          lifecycle: 'production',
          owner: 'group:team-atools',
          definition: 'DUMMY TEXT',
        },
      },
    ]);
  });

  it('Should successfully validate catalog info with an annotation that look like a date', async () => {
    await expect(
      validator.validateFromFile('catalog-info-with-date-annotation.yaml'),
    ).resolves.toEqual([
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'sample-service-6',
          namespace: 'default',
          annotations: {
            'annotation-with-date-like-value': '1955-11-05',
          },
        },
        spec: {
          type: 'service',
          lifecycle: 'experimental',
          owner: 'group:team-atools',
        },
      },
    ]);
  });

  it('Should fail to validate with incorrect catalog-info that has an empty label', async () => {
    await expect(
      validator.validateFromFile('catalog-info-with-empty-label.yaml'),
    ).rejects.toThrow(
      "Error: Placeholder with name 'definition' is empty. Please remove it or populate it.",
    );
  });
  it('Should fail to validate with bad techdocs path', async () => {
    await expect(
      validator.validateFromFile('catalog-info-with-bad-techdocs-dir.yaml'),
    ).rejects.toThrow('Techdocs annotation specifies "dir" but file under');
  });
  it('Should throw validation error for system entity', async () => {
    await expect(
      validator.validateFromFile('invalid-system-entity.yaml'),
    ).rejects.toThrow();
  });
  it('Should throw validation error for domain entity', async () => {
    await expect(
      validator.validateFromFile('invalid-domain-entity.yaml'),
    ).rejects.toThrow();
  });
  it('Should throw validation error for resource entity', async () => {
    await expect(
      validator.validateFromFile('invalid-resource-entity.yaml'),
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
        ).resolves.toEqual([
          {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
              namespace: 'default',
              name: 'test-entity',
              description: 'Foo bar description\n',
              annotations: {
                'backstage.io/techdocs-ref': 'dir:.',
              },
            },
            spec: {
              type: 'service',
              lifecycle: 'experimental',
              owner: 'user:dtuite',
            },
          },
        ]);
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
        ).resolves.toEqual([
          {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
              namespace: 'default',
              name: 'test-entity',
              description: 'Foo bar description\n',
              annotations: {
                'backstage.io/techdocs-ref': 'dir:test-dir',
              },
            },
            spec: {
              type: 'service',
              lifecycle: 'experimental',
              owner: 'user:dtuite',
            },
          },
        ]);
      });
      it('should resolve when mkdocs.yml found', async () => {
        vol.fromJSON({ ...defaultVol, 'test-dir/mkdocs.yml': 'bar' });
        await expect(
          validator.validateFromFile('./test-entity.yaml'),
        ).resolves.toEqual([
          {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
              namespace: 'default',
              name: 'test-entity',
              description: 'Foo bar description\n',
              annotations: {
                'backstage.io/techdocs-ref': 'dir:test-dir',
              },
            },
            spec: {
              type: 'service',
              lifecycle: 'experimental',
              owner: 'user:dtuite',
            },
          },
        ]);
      });
    });
  });
  describe('template', () => {
    it('Should successfully validate v2 template', async () => {
      await expect(
        validator.validateFromFile('template-v2-entity.yaml'),
      ).resolves.toEqual([
        {
          apiVersion: 'backstage.io/v1beta2',
          kind: 'Template',
          metadata: {
            namespace: 'default',
            name: 'sample-template-v2',
          },
          spec: {
            type: 'foo',
            steps: [
              {
                action: 'roadiehq:utils:zip',
                id: 'zip',
                input: {
                  outputPath: 'foo.zip',
                  path: 'foo.txt',
                },
                name: 'Zip',
              },
            ],
          },
        },
      ]);
    });

    it('Should successfully validate v3 template', async () => {
      await expect(
        validator.validateFromFile('template-v3-entity.yaml'),
      ).resolves.toEqual([
        {
          apiVersion: 'scaffolder.backstage.io/v1beta3',
          kind: 'Template',
          metadata: {
            namespace: 'default',
            name: 'sample-template-v3',
          },
          spec: {
            type: 'foo',
            steps: [
              {
                action: 'roadiehq:utils:zip',
                id: 'zip',
                input: {
                  outputPath: 'foo.zip',
                  path: 'foo.txt',
                },
                name: 'Zip',
              },
            ],
          },
        },
      ]);
    });
  });

  describe('customValidationSchema', () => {
    it('should successfully validate against custom annotation schema', async () => {
      await expect(
        validator.validateFromFile(
          'catalog-info-with-custom-fields.yaml',
          false,
          'custom-validation-schema.json',
        ),
      ).resolves.toEqual([
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            namespace: 'default',
            name: 'sample-service-5',
            description:
              'A service for testing Backstage functionality. Configured for GitHub Actions, Sentry, AWS Lambda, Datadog and mis-configured techdocs.\n',
            annotations: {
              'backstage.io/source-location':
                'url:https://github.com/RoadieHQ/sample-service/tree/main/',
              'backstage.io/view-url':
                'https://github.com/RoadieHQ/sample-service/tree/main',
              'custom/source-location': 'custom-field-value:12342',
              'github.com/project-slug': 'roadiehq/sample-service',
            },
          },
          spec: {
            type: 'service',
            lifecycle: 'experimental',
            owner: 'user:dtuite',
          },
        },
      ]);
    });

    it('should throw validate error when validating against custom annotation schema', async () => {
      await expect(
        validator.validateFromFile(
          'catalog-info-with-custom-fields-with-errors.yaml',
          false,
          'custom-validation-schema.json',
        ),
      ).rejects.toThrow(
        'Error: Malformed annotation, /metadata/annotations/custom~1source-location must match pattern "^custom-field-value:\\d*$"',
      );
    });
  });

  describe('source-location annotation', () => {
    const baseEntity = `
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: test-entity
  description: Test entity
  annotations:
    backstage.io/source-location: %s
spec:
  type: service
  owner: user:test
  lifecycle: experimental
`;

    it.each([
      ['url:https://github.com/org/repo/tree/main/'],
      ['gitlab:https://gitlab.com/org/repo/-/tree/main/'],
      ['github:https://github.com/org/repo/tree/main/'],
      ['url:https://bitbucket.org/org/repo/branch/main/'],
      ['azure/api:https://dev.azure.com/org/project/_git/repo?path=/'],
    ])(
      'should validate URLs with trailing slash for directories: %s',
      async url => {
        vol.fromJSON({
          'test-entity.yaml': baseEntity.replace('%s', url),
        });
        await expect(
          validator.validateFromFile('test-entity.yaml'),
        ).resolves.toBeDefined();
      },
    );

    it.each([['dir:./org/test/'], ['dir:.'], ['dir:./org/test']])(
      'should validate path with or without trailing slash for dir type: %s',
      async url => {
        vol.fromJSON({
          'test-entity.yaml': baseEntity.replace('%s', url),
        });
        await expect(
          validator.validateFromFile('test-entity.yaml'),
        ).resolves.toBeDefined();
      },
    );

    it.each([
      ['url:https://github.com/org/repo/blob/main/file.txt'],
      ['gitlab:https://gitlab.com/org/repo/-/blob/main/file.json'],
      ['github:https://github.com/org/repo/blob/main/file.md'],
      ['url:https://bitbucket.org/org/repo/branch/main/file.yml'],
      ['azure/api:https://dev.azure.com/org/project/_git/repo?path=/file.txt'],
    ])(
      'should validate URLs without trailing slash for files: %s',
      async url => {
        vol.fromJSON({
          'test-entity.yaml': baseEntity.replace('%s', url),
        });
        await expect(
          validator.validateFromFile('test-entity.yaml'),
        ).resolves.toBeDefined();
      },
    );

    it.each([
      ['url:https://github.com/org/repo/tree/main'],
      ['gitlab:https://gitlab.com/org/repo/-/tree/main'],
      ['github:https://github.com/org/repo/tree/main'],
      ['url:https://bitbucket.org/org/repo/branch/main'],
      ['azure/api:https://dev.azure.com/org/project/_git/repo?path='],
    ])(
      'should reject URLs without trailing slash for directories: %s',
      async url => {
        vol.fromJSON({
          'test-entity.yaml': baseEntity.replace('%s', url),
        });
        await expect(
          validator.validateFromFile('test-entity.yaml'),
        ).rejects.toThrow(
          'Error: Malformed annotation, /metadata/annotations/backstage.io~1source-location must match pattern "^(?:dir:.*|(?:(?:github|gitlab|url):.+/|azure/api:.*\\?path=.*/)(?:[^/]+\\.[^/]+)?)$"',
        );
      },
    );
  });
});
