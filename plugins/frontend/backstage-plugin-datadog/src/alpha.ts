import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { entityContentRouteRef } from './plugin';
import {
  datadogApi,
  entityDatadogContent,
  entityDatadogGraphCard,
} from './alpha/index';

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'datadog',
  // bind all the extensions to the plugin
  extensions: [datadogApi, entityDatadogContent, entityDatadogGraphCard],
  // convert old route refs to the new system
  routes: convertLegacyRouteRefs({
    entityContent: entityContentRouteRef,
  }),
});
