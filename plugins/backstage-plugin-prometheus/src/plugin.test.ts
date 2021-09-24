import { backstagePluginPrometheusPlugin } from './plugin';

describe('backstage-plugin-prometheus', () => {
  it('should export plugin', () => {
    expect(backstagePluginPrometheusPlugin).toBeDefined();
  });
});
