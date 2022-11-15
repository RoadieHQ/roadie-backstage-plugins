# Catalog Backend Module for Okta

This is an extension module to the plugin-catalog-backend plugin, providing
entity providers to read Okta Group and User objects as Backstage Entities.

To setup the Okta providers you will need an [Okta API Token](https://developer.okta.com/docs/guides/create-an-api-token/main/)

## App Config

You will need to configure your okta credentials in the `app-config.yaml`.

### Basic Config

```yaml
catalog:
  providers:
    okta:
      - orgUrl: 'https://tenant.okta.com'
        token:
          $env: OKTA_TOKEN
```

### Filter Users and Groups

Thw provider allows configuring Okta search filtering for users and groups. See here for more details on what is possible: https://developer.okta.com/docs/reference/core-okta-api/#filter

```yaml
catalog:
  providers:
    okta:
      - orgUrl: 'https://tenant.okta.com'
        token:
          $env: OKTA_TOKEN
        userFilter: profile.department eq "engineering"
        groupFilter: profile.name eq "Everyone"
```

There are two ways that you can configure the Entity providers. You can either use the `OktaOrgEntityProvider` which loads both users and groups. Or you can load user or groups separately user the `OktaUserEntityProvider` and `OktaGroupEntityProvider` providers.

## Load Users and Groups Together

### OktaOrgEntityProvider

You can configure the provider with different naming strategies. The configured strategy will be used to generate the discovered entity's `metadata.name` field. The currently supported strategies are the following:

User naming stategies:

- id (default) | User entities will be named by the user id.
- kebab-case-email | User entities will be named by their profile email converted to kebab case.
- strip-domain-email | User entities will be named by their profile email without the domain part.

Group naming strategies:

- id (default) | Group entities will be named by the group id.
- kebab-case-name | Group entities will be named by their group profile name converted to kebab case.

### Example configuration:

```typescript
import { OktaOrgEntityProvider } from '@roadiehq/catalog-backend-module-okta';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  const orgProvider = OktaOrgEntityProvider.fromConfig(env.config, {
    logger: env.logger,
    userNamingStrategy: 'strip-domain-email',
    groupNamingStrategy: 'kebab-case-name',
  });

  builder.addEntityProvider(orgProvider);

  const { processingEngine, router } = await builder.build();

  orgProvider.run();

  await processingEngine.start();

  // ...

  return router;
}
```

## Load Users and Groups Separately

### OktaUserEntityProvider

You can configure the provider with different naming strategies. The configured strategy will be used to generate the discovered entity's `metadata.name` field. The currently supported strategies are the following:

- id (default) | User entities will be named by the user id.
- kebab-case-email | User entities will be named by their profile email converted to kebab case.
- strip-domain-email | User entities will be named by their profile email without the domain part.

### OktaGroupEntityProvider

You can configure the provider with different naming strategies. The configured strategy will be used to generate the discovered entities `metadata.name` field. The currently supported strategies are the following:

User naming stategies:

- id (default) | User entities will be named by the user id.
- kebab-case-email | User entities will be named by their profile email converted to kebab case.
- strip-domain-email | User entities will be named by their profile email without the domain part.

Group naming strategies:

- id (default) | Group entities will be named by the group id.
- kebab-case-name | Group entities will be named by their group profile name converted to kebab case.

Make sure you use the OktaUserEntityProvider's naming strategy for the OktaGroupEntityProvider's user naming strategy.

### Example configuration:

```typescript
import {
  OktaUserEntityProvider,
  OktaGroupEntityProvider,
} from '@roadiehq/catalog-backend-module-okta';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  const oktaConfig = env.config.getOptionalConfigArray(
    'catalog.providers.okta',
  );
  const userProvider = OktaUserEntityProvider.fromConfig(oktaConfig[0], {
    logger: env.logger,
    namingStrategy: 'strip-domain-email',
  });
  const groupProvider = OktaGroupEntityProvider.fromConfig(oktaConfig[0], {
    logger: env.logger,
    userNamingStrategy: 'strip-domain-email',
    groupNamingStrategy: 'kebab-case-name',
  });

  builder.addEntityProvider(userProvider);
  builder.addEntityProvider(groupProvider);

  const { processingEngine, router } = await builder.build();

  userProvider.run();
  groupProvider.run();

  await processingEngine.start();

  // ...

  return router;
}
```
