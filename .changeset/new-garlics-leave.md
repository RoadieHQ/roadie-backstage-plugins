---
'@roadiehq/backstage-plugin-wiz': major
'@roadiehq/plugin-wiz-backend': major
---

**BREAKING** Fixed an issue with backend plugin initialisation approach which required additional configuration for the end user.

This fix allows plugin consumers to add the backend plugin using the new backend system, unfortunately, this breaks existing approaches as plugin consumers will have customised the backend plugin to respond on the incorrect/previous URL.

Using v2 of the frontend (backstage-plugin-wiz) plugin requires v2 of the backend (plugin-wiz-backend) plugin.

These changes are **required** to `packages/backend/src/index.ts`

```diff
+ // Install wiz backend plugin
+ backend.add(import('@roadiehq/plugin-wiz-backend'));
- import wiz from './plugins/wiz';
- // ...
- async function main() {
-   // ...
-   const wizEnv = useHotMemoize(module, () => createEnv('wiz'));
-
-   const wizConfig = {
-   clientId: config.getOptionalString('wiz.clientId'),
-   clientSecret: config.getOptionalString('wiz.clientSecret'),
-   tokenUrl: config.getOptionalString('wiz.tokenUrl'),
-   apiUrl: config.getOptionalString('wiz.wizAPIUrl'),
- };
-
-   const apiRouter = Router();
-     if (wizConfig.enabled && wizConfig.clientId && wizConfig.clientSecret && wizConfig.tokenUrl && wizConfig.apiUrl) {
-     router.use('/wiz-backend', await wiz(wizEnv));
-   } await wiz(wizEnv));
-   // ...
- }
```

And you can remove the previous plugin customisation file `packages/backend/src/plugins/wiz.ts`
