import {
  ApiBlueprint,
  createApiFactory,
  discoveryApiRef,
} from '@backstage/frontend-plugin-api';
import { datadogApiRef, DatadogApiClient } from '../api';

/**
 * @alpha
 */
export const datadogApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: datadogApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new DatadogApiClient({ discoveryApi }),
    }),
  },
});
