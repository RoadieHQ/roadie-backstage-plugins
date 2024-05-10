# Catalog Backend Module for Okta

This is an extension module to the plugin-catalog-backend plugin, providing
entity providers to read Okta Group and User objects as Backstage Entities.

To setup the Okta providers you will need an [Okta API Token](https://developer.okta.com/docs/guides/create-an-api-token/main/)

## App Config

You will need to configure your okta credentials in the `app-config.yaml`.

### Basic Config via an API Token

```yaml
catalog:
  providers:
    okta:
      - orgUrl: 'https://tenant.okta.com'
        token: ${OKTA_TOKEN}
```

### OAuth 2.0 Scoped Authentication

[Create an OAuth app](https://developer.okta.com/docs/guides/implement-oauth-for-okta/main/#create-an-oauth-2-0-app-in-okta) in Okta. You will need to grant it with the `okta.groups.read` and `okta.users.read` scopes as a bare minimum. In the following example the `oauth.privateKey` may be passed as either a string encoded PEM or stringified JWK.

```yaml
catalog:
  providers:
    okta:
      - orgUrl: 'https://tenant.okta.com'
        oauth:
          clientId: ${OKTA_OAUTH_CLIENT_ID},
          keyId: ${OKTA_OAUTH_KEY_ID},
          privateKey: ${OKTA_OAUTH_PRIVATE_KEY},
```

Note: `keyId` is optional but _must_ be passed wen using a PEM as the `privateKey`

### Filter Users and Groups

The provider allows configuring Okta search filtering for users and groups. See here for more details on what is possible: https://developer.okta.com/docs/reference/core-okta-api/#filter

```yaml
catalog:
  providers:
    okta:
      - orgUrl: 'https://tenant.okta.com'
        token: ${OKTA_TOKEN}
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

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customUserNamingStrategy: UserNamingStrategy = user =>
  user.profile.customField;
```

Group naming strategies:

- id (default) | Group entities will be named by the group id.
- kebab-case-name | Group entities will be named by their group profile name converted to kebab case.
- profile-name | Group entities will be named exactly as their group profile name. ⚠ The Okta field supports characters not supported as [entity names in backstage](https://backstage.io/docs/features/software-catalog/descriptor-format#name-required). ⚠

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customGroupNamingStrategy: GroupNamingStrategy = group =>
  group.profile.customField;
```

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

You can optionally provide the ability to create a hierarchy of groups by providing `hierarchyConfig`.

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
    hierarchyConfig: {
      key: 'profile.orgId',
      parentKey: 'profile.parentOrgId',
    },
  });

  builder.addEntityProvider(orgProvider);

  const { processingEngine, router } = await builder.build();

  orgProvider.run();

  await processingEngine.start();

  // ...

  return router;
}
```

In case you want to customize the emitted entities, the provider allows to pass custom transformers for users and groups by providing `userTransformer` and `groupTransformer`.

1. Create a transformer:

```typescript
import { GroupNamingStrategy } from '@roadiehq/catalog-backend-module-okta';
import { GroupEntity } from '@backstage/catalog-model';
import { Group } from '@okta/okta-sdk-nodejs';

function myGroupTransformer(
  group: Group,
  namingStrategy: GroupNamingStrategy,
  parentGroup: Group | undefined,
  options: {
    annotations: Record<string, string>;
    members: string[];
  },
): GroupEntity {
  // Enrich it with your logic
  const groupEntity: GroupEntity = {
    kind: 'Group',
    apiVersion: 'backstage.io/v1alpha1',
    metadata: {
      annotations: {
        ...options.annotations,
      },
      name: namingStrategy(group),
      title: group.profile.name,
      title: group.profile.description || group.profile.name,
      description: group.profile.description || '',
    },
    spec: {
      members: options.members,
      type: 'group',
      children: [],
    },
  };

  if (parentGroup) {
    groupEntity.spec.parent = namingStrategy(parentGroup);
  }
  return groupEntity;
}
```

2. Configure the provider with the transformer:

```typescript
import { OktaOrgEntityProvider } from '@roadiehq/catalog-backend-module-okta';
import { myGroupTransformer } from './myGroupTransformer';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  const orgProvider = OktaOrgEntityProvider.fromConfig(env.config, {
    logger: env.logger,
    userNamingStrategy: 'strip-domain-email',
    groupNamingStrategy: 'kebab-case-name',
    groupTransformer: myGroupTransformer,
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

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customUserNamingStrategy: UserNamingStrategy = user =>
  user.profile.customField;
```

In case you want to customize the emitted entities, the provider allows to pass custom transformer by providing `userTransformer`.

1. Create a transformer:

```typescript
import { UserEntity } from '@backstage/catalog-model';
import { User } from '@okta/okta-sdk-nodejs';
import { UserNamingStrategy } from '@roadiehq/catalog-backend-module-okta';

function myUserTransformer(
  user: User,
  namingStrategy: UserNamingStrategy,
  options: { annotations: Record<string, string> },
): UserEntity {
  // Enrich it with your logic
  return {
    kind: 'User',
    apiVersion: 'backstage.io/v1alpha1',
    metadata: {
      annotations: { ...options.annotations },
      name: namingStrategy(user),
      title: user.profile.email,
    },
    spec: {
      profile: {
        displayName: user.profile.displayName,
        email: user.profile.email,
      },
      memberOf: [],
    },
  };
}
```

2. Configure the provider with the transformer:

```typescript
import { OktaUserEntityProvider } from '@roadiehq/catalog-backend-module-okta';
import { myUserTransformer } from './myUserTransformer';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  const userProvider = OktaUserEntityProvider.fromConfig(env.config, {
    logger: env.logger,
    namingStrategy: 'strip-domain-email',
    userTransformer: myUserTransformer,
  });

  builder.addEntityProvider(userProvider);

  const { processingEngine, router } = await builder.build();

  userProvider.run();

  await processingEngine.start();

  // ...

  return router;
}
```

### OktaGroupEntityProvider

You can configure the provider with different naming strategies. The configured strategy will be used to generate the discovered entities `metadata.name` field. The currently supported strategies are the following:

User naming stategies:

- id (default) | User entities will be named by the user id.
- kebab-case-email | User entities will be named by their profile email converted to kebab case.
- strip-domain-email | User entities will be named by their profile email without the domain part.

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customUserNamingStrategy: UserNamingStrategy = user =>
  user.profile.customField;
```

Group naming strategies:

- id (default) | Group entities will be named by the group id.
- kebab-case-name | Group entities will be named by their group profile name converted to kebab case.
- profile-name | Group entities will be named exactly as their group profile name. ⚠ The Okta field supports characters not supported as [entity names in backstage](https://backstage.io/docs/features/software-catalog/descriptor-format#name-required). ⚠

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customGroupNamingStrategy: GroupNamingStrategy = group =>
  group.profile.customField;
```

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

  const oktaConfig =
    env.config.getOptionalConfigArray('catalog.providers.okta') || [];
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

You can optionally provide the ability to create a hierarchy of groups by providing the `hierarchyConfig`.

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
    hierarchyConfig: {
      key: 'profile.orgId',
      parentKey: 'profile.parentOrgId',
    },
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

In case you want to customize the emitted entities, the provider allows to pass custom transformer by providing `groupTransformer`.

1. Create a transformer:

```typescript
import { GroupNamingStrategy } from '@roadiehq/catalog-backend-module-okta';
import { GroupEntity } from '@backstage/catalog-model';
import { Group } from '@okta/okta-sdk-nodejs';

function myGroupTransformer(
  group: Group,
  namingStrategy: GroupNamingStrategy,
  parentGroup: Group | undefined,
  options: {
    annotations: Record<string, string>;
    members: string[];
  },
): GroupEntity {
  // Enrich it with your logic
  const groupEntity: GroupEntity = {
    kind: 'Group',
    apiVersion: 'backstage.io/v1alpha1',
    metadata: {
      annotations: {
        ...options.annotations,
      },
      name: namingStrategy(group),
      title: group.profile.name,
      title: group.profile.description || group.profile.name,
      description: group.profile.description || '',
    },
    spec: {
      members: options.members,
      type: 'group',
      children: [],
    },
  };

  if (parentGroup) {
    groupEntity.spec.parent = namingStrategy(parentGroup);
  }
  return groupEntity;
}
```

2. Configure the provider with the transformer:

```typescript
import { OktaGroupEntityProvider } from '@roadiehq/catalog-backend-module-okta';
import { myGroupTransformer } from './myGroupTransformer';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  const groupProvider = OktaGroupEntityProvider.fromConfig(env.config, {
    logger: env.logger,
    userNamingStrategy: 'strip-domain-email',
    groupNamingStrategy: 'kebab-case-name',
    groupTransformer: myGroupTransformer,
  });

  builder.addEntityProvider(groupProvider);

  const { processingEngine, router } = await builder.build();

  groupProvider.run();

  await processingEngine.start();

  // ...

  return router;
}
```

## New backend system

```typescript
import { coreServices } from '@backstage/backend-plugin-api';
import { oktaCatalogBackendEntityProviderFactoryExtensionPoint } from '@roadiehq/catalog-backend-module-okta/new-backend';

export const oktaCatalogBackendModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'okta-entity-provider-custom',
  register(env) {
    env.registerInit({
      deps: {
        provider: oktaCatalogBackendEntityProviderFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ provider, logger }) {
        const factory: EntityProviderFactory = (oktaConfig: Config) =>
          OktaOrgEntityProvider.fromConfig(oktaConfig, {
            logger: loggerToWinstonLogger(logger),
            userNamingStrategy: 'strip-domain-email',
            groupNamingStrategy: 'kebab-case-name',
          });

        provider.setEntityProviderFactory(factory);
      },
    });
  },
});
```
