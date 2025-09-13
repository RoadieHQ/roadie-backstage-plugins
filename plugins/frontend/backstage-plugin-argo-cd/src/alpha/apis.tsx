import { ApiBlueprint, discoveryApiRef } from '@backstage/frontend-plugin-api';
import { ArgoCDApiClient, argoCDApiRef } from '../api';
import { configApiRef, identityApiRef } from '@backstage/core-plugin-api';

/**
 * @alpha
 */
export const argoCDApiExtension = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: argoCDApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, identityApi, configApi }) =>
        new ArgoCDApiClient({
          discoveryApi,
          identityApi,
          backendBaseUrl: configApi.getString('backend.baseUrl'),
          useNamespacedApps: Boolean(
            configApi.getOptionalBoolean('argocd.namespacedApps'),
          ),
          searchInstances: Boolean(
            configApi.getOptionalConfigArray('argocd.appLocatorMethods')
              ?.length,
          ),
        }),
    }),
});
