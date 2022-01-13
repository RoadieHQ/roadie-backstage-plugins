import { getCatalogFiles } from './utils';
import mock from 'mock-fs';

describe('getCatalogFiles', () => {
  beforeEach(() => {
    mock({
      'test-backstage.yaml':
        'apiVersion: backstage.io/alphav1beta1\nkind: Component',
      'not-backstage.yaml': 'kind: Ingress\napiVersion: beta1',
      '.roadie': {
        'catalog-info.yaml':
          'apiVersion: backstage.io/alphav1beta1\nmetadata:\n  name: test-app',
      },
      'not-even-yaml.txt': 'some basic text file',
    });
  });
  afterEach(() => {
    mock.restore();
  });
  it('Should list all backstage yaml files in the current context.', async () => {
    const expected = ['./.roadie/catalog-info.yaml', './test-backstage.yaml'];

    const result = getCatalogFiles();

    expect(result).toEqual(expected);
  });
  it('should list backstage yaml files in the given context', () => {
    const expected = ['.roadie/catalog-info.yaml'];

    const result = getCatalogFiles('.roadie');

    expect(result).toEqual(expected);
  });
  it('should handle when there are no yaml files in the context', () => {
    mock({});
    const expected = [];

    const result = getCatalogFiles();

    expect(result).toEqual(expected);
  });
});
