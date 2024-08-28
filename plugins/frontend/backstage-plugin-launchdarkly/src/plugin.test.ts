import { launchdarklyPlugin } from './plugin';

describe('launchdarkly', () => {
  it('should export plugin', () => {
    expect(launchdarklyPlugin).toBeDefined();
  });
});
