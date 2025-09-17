import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import {
  FrontendPlugin,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { entityContentRouteRef } from './plugin';
import {
  datadogApi,
  entityDatadogContent,
  entityDatadogGraphCard,
} from './alpha/index';

/**
 * @alpha
 */
const plugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'datadog',
  // bind all the extensions to the plugin
  extensions: [datadogApi, entityDatadogContent, entityDatadogGraphCard],
  // convert old route refs to the new system
  routes: convertLegacyRouteRefs({
    entityContent: entityContentRouteRef,
  }),
});

export default plugin;
