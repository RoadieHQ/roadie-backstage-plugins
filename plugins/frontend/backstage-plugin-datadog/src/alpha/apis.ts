import { ApiBlueprint, discoveryApiRef } from '@backstage/frontend-plugin-api';
import { datadogApiRef, DatadogApiClient } from '../api';

/**
 * @alpha
 */
export const datadogApi = ApiBlueprint.make({
  params: paramsFactory =>
    paramsFactory({
      api: datadogApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new DatadogApiClient({ discoveryApi }),
    }),
});
