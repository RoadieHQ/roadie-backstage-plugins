import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';

export interface DatadogApi {}

export const datadogApiRef = createApiRef<DatadogApi>({
  id: 'plugin.datadog.service',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  proxyPath?: string;
};

export class DatadogApiClient implements DatadogApi {
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }
}
