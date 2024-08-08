import {
  createApiExtension,
  createApiFactory,
  discoveryApiRef,
} from '@backstage/frontend-plugin-api';
import { datadogApiRef, DatadogApiClient } from '../api';

/**
 * @alpha
 */
export const datadogApi = createApiExtension({
  factory: createApiFactory({
    api: datadogApiRef,
    deps: { discoveryApi: discoveryApiRef },
    factory: ({ discoveryApi }) => new DatadogApiClient({ discoveryApi }),
  }),
});
