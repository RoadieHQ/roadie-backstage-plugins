import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  entityArgoCDOverviewCard,
  entityArgoCDHistoryCard,
} from './entityCards';
import { argoCDApiExtension } from './apis';
import { entityContentRouteRef } from '../plugin';

/**
 * @alpha
 */
export default createFrontendPlugin({
  id: 'argocd',
  extensions: [
    entityArgoCDOverviewCard,
    entityArgoCDHistoryCard,
    argoCDApiExtension,
  ],
  routes: convertLegacyRouteRefs({ argocd: entityContentRouteRef }),
});
