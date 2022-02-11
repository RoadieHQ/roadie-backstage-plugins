const validator = require('./validator')

describe('validator',  () => {
  it('Should successfully validate simple catalog info', async () => {
    await expect(validator.validateFromFile('./sample/catalog-info.yml')).resolves.toBeUndefined();
  });

  it('Should fail to validate with incorrect catalog-info', async () => {
    await expect(validator.validateFromFile('./sample/invalid-catalog-info.yml')).rejects.toThrow();
  });

  it('Should successfully validate catalog info with replacements', async () => {
    await expect(validator.validateFromFile('./sample/catalog-info-with-replacement.yml')).resolves.toBeUndefined();
  });

  it('Should fail to validate with incorrect catalog-info that has an empty label', async () => {
    await expect(validator.validateFromFile('./sample/catalog-info-with-empty-label.yml')).rejects.toThrow("Error: Placeholder with name 'definition' is empty. Please remove it or populate it.");
  });
  it('Should fail to validate with bad techdocs path', async () => {
    await expect(validator.validateFromFile('./sample/catalog-info-with-bad-techdocs-dir.yml')).rejects.toThrow('Techdocs annotation specifies "dir" but file under');
  });
  it('Should throw validation error for system entity', async ()=> {
    await expect(validator.validateFromFile('./sample/invalid-system-entity.yml')).rejects.toThrow()
  })
  it('Should throw validation error for domain entity', async ()=> {
    await expect(validator.validateFromFile('./sample/invalid-domain-entity.yml')).rejects.toThrow()
  })
  it('Should throw validation error for resource entity', async ()=> {
    await expect(validator.validateFromFile('./sample/invalid-resource-entity.yml')).rejects.toThrow()
  })
})

