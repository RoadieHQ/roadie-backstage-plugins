import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import {
  createFrontendPlugin,
  FrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  entityArgoCDOverviewCard,
  entityArgoCDHistoryCard,
} from './entityCards';
import { argoCDApiExtension } from './apis';

import { entityContentRouteRef } from '../plugin';
import { argoCdPage } from './pages';

/**
 * @alpha
 */
const plugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'argocd',
  extensions: [
    argoCdPage,
    entityArgoCDOverviewCard,
    entityArgoCDHistoryCard,
    argoCDApiExtension,
  ],
  routes: convertLegacyRouteRefs({ argocd: entityContentRouteRef }),
});

export default plugin;
