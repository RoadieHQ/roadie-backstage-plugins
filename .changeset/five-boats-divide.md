---
'@roadiehq/backstage-plugin-argo-cd-backend': major
---

Fix: No longer expecting winston logger types for router. This may cause type errors in development.

BREAKING CHANGE:

We have extracted the argo cd service into its own service factory/reference. The change was made to enable dependency injection of the argocd service into the router. Dependency injection helps with testing the functionality of the code more easily. Service factories also have several checks that backstage validates at startup - like those that prevent circular depdnencies, and validation on dependencies missing.

This is a breaking change because if you are using the new backend system, you will need to now import the argocd service in your `backend/index.ts` file like this:

```typescript
import { argocdServiceFactory } from '@roadiehq/backstage-plugin-argo-cd-backend';

backend.add(argocdServiceFactory); // NEW!! Import Service Factory
backend.add(import('@roadiehq/backstage-plugin-argo-cd-backend/alpha')); // Import Plugin
```

If you are using the legacy backend service, then you will have to create the router passing in the argo cd service, which is already made available:

```typescript
export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment) {
  console.log('ArgoCD plugin is initializing');
  const argoUserName =
    config.getOptionalString('argocd.username') ?? 'argocdUsername';
  const argoPassword =
    config.getOptionalString('argocd.password') ?? 'argocdPassword';
  return createRouter({
    logger,
    config,
    argocdService: new ArgoService(argoUserName, argoPassword, config, logger), // you must now pass the argo service
  });
}
```
