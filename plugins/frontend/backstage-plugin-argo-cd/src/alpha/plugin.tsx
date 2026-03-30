import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
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
export default createFrontendPlugin({
  pluginId: 'argocd',
  extensions: [
    argoCdPage,
    entityArgoCDOverviewCard,
    entityArgoCDHistoryCard,
    argoCDApiExtension,
  ],
  routes: convertLegacyRouteRefs({ argocd: entityContentRouteRef }),
});
