export * from './service/router';
export { ArgoService } from './service/argocd.service';
export { ArgoCDPlugin as default } from './plugin';

// Re-export the public node-library API so that consumers who already depend
// on this package don't need an immediate migration.
// This includes argocdServiceRef, argocdServiceFactory, ArgoService, and all types.
export * from '@roadiehq/backstage-plugin-argo-cd-node';
