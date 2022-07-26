# Catalog Backend Module for Okta

This is an extension module to the plugin-catalog-backend plugin, providing
entity providers to read Okta Group and User objects as Backstage Entities.

To setup the Okta providers you will need an [Okta API Token](https://developer.okta.com/docs/guides/create-an-api-token/main/)

You will need to configure the providers in your catalog.ts file in your backstage backend:

```typescript
import {
  OktaUserProvider,
  OktaGroupProvider,
} from '@roadiehq/catalog-backend-module-okta';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  const userProvider = OktaUserProvider.fromConfig(config, env);
  const groupProvider = OktaGroupProvider.fromConfig(config, env);

  builder.addEntityProvider(userProvider);
  builder.addEntityProvider(groupProvider);

  userProvider.run();
  groupProvider.run();

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  // ...

  return router;
}
```

Then you will need to configure your okta credentials in the `app-config.yaml`.

```yaml
integrations:
  okta:
    - orgUrl: 'https://tenant.okta.com'
      token:
        $env: OKTA_TOKEN
```
