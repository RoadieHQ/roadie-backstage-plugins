jest.mock('fs');

const validator = require('./validator');
const { vol } = require('memfs');
const { memoryFileSystem } = require('./mocks');

describe('validator', () => {
  beforeEach(() => {
    vol.reset();
    vol.fromJSON(memoryFileSystem);
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
});
