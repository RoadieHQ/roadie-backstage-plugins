import { travisciPlugin } from './plugin';

describe('travis-ci', () => {
  it('should export plugin', () => {
    expect(travisciPlugin).toBeDefined();
  });
});
