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
})

