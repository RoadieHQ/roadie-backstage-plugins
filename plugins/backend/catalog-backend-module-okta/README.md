# Catalog Backend Module for Okta

This is an extension module to the plugin-catalog-backend plugin, providing
entity providers to read Okta Group and User objects as Backstage Entities.

To setup the Okta providers you will need
an [Okta API Token](https://developer.okta.com/docs/guides/create-an-api-token/main/)

## Installation

To install the plugin dependency in your Backstage app, from the root of your project run:

```bash
yarn --cwd packages/backend add @roadiehq/catalog-backend-module-okta
```

## App Config

You will need to configure your okta credentials in the `app-config.yaml`.

### Basic Config via an API Token

```yaml
catalog:
  providers:
    okta:
      - orgUrl: 'https://tenant.okta.com'
        token: ${OKTA_TOKEN}
        schedule:
          frequency:
            minutes: 5
          timeout:
            minutes: 10
          initialDelay:
            minutes: 1
```

### OAuth 2.0 Scoped Authentication

[Create an OAuth app](https://developer.okta.com/docs/guides/implement-oauth-for-okta/main/#create-an-oauth-2-0-app-in-okta)
in Okta. You will need to grant it with the `okta.groups.read` and `okta.users.read` scopes as a bare minimum. In the
following example the `oauth.privateKey` may be passed as either a string encoded PEM or stringified JWK.

```yaml
catalog:
  providers:
    okta:
      - orgUrl: 'https://tenant.okta.com'
        oauth:
          clientId: ${OKTA_OAUTH_CLIENT_ID}
          keyId: ${OKTA_OAUTH_KEY_ID}
          privateKey: ${OKTA_OAUTH_PRIVATE_KEY}
        schedule:
          frequency:
            minutes: 5
          timeout:
            minutes: 10
          initialDelay:
            minutes: 1
```

Note: `keyId` is optional but _must_ be passed when using a PEM as the `privateKey`

### Filter Users and Groups

The provider allows configuring Okta search filtering for users and groups. See here for more details on what is
possible: https://developer.okta.com/docs/reference/core-okta-api/#filter

```yaml
catalog:
  providers:
    okta:
      - orgUrl: 'https://tenant.okta.com'
        token: ${OKTA_TOKEN}
        userFilter: profile.department eq "engineering"
        groupFilter: profile.name eq "Everyone"
        schedule:
          frequency:
            minutes: 5
          timeout:
            minutes: 10
          initialDelay:
            minutes: 1
```

## Adding the provider

First, add the required okta-entity-provider dependency to your backend in the `packages/backend/src/index.ts` file:

```typescript
backend.add(
  import('@roadiehq/catalog-backend-module-okta/okta-entity-provider'),
);
```

Now, you need to add a provider factory that will define the strategy used to load users and groups. We provide three
default
factory that you can use out of the box, or your can create your own custom one, let's explore both options.

### Default entity providers

The Okta catalog module provides default implementations of 3 entity providers that can be used with the Backstage
backend system.

To integrate these into your application, add them after the okta-entity-provider, like this:

```typescript
backend.add(
  import('@roadiehq/catalog-backend-module-okta/okta-entity-provider'), // The required entity provider
);
backend.add(
  import('@roadiehq/catalog-backend-module-okta/org-provider-factory'), // Optional - Load both users and groups
);
```

The provider factory decides which kind of entities are provided for you.
The options are:

- `org-provider-factory` - Loads both users and groups
- `user-provider-factory` - Loads only users
- `group-provider-factory` - Loads only groups

## Custom entity provider(s)

Instead of using the default entity providers, you can create your own custom entity provider(s) by implementing the
`EntityProvider` interface.

You can also tailor the entity providers to handle different configurations if there is a need to add specific logic for
example naming strategies for your entities.

> ⚠️ **Note:** You use either the custom entity provider\(s\) or the default ones, not both.

### Load Users and Groups Together - OktaOrgEntityProvider

You can construct your own configuration of OktaOrgEntityProvider factory and register it into the backend:

In a separated file of your choice, to avoid cluttering the `packages/backend/src/index.ts` file,
you can create a new module that will contain the custom entity provider registration logic.

```typescript
import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import {
  oktaCatalogBackendEntityProviderFactoryExtensionPoint,
  EntityProviderFactory,
  OktaOrgEntityProvider,
} from '@roadiehq/catalog-backend-module-okta/new-backend';
import { Config } from '@backstage/config';

export const oktaOrgEntityProviderModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'default-okta-org-entity-provider',
  register(env) {
    env.registerInit({
      deps: {
        provider: oktaCatalogBackendEntityProviderFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ provider, logger }) {
        const factory: EntityProviderFactory = (oktaConfig: Config) =>
          OktaOrgEntityProvider.fromConfig(oktaConfig, {
            logger: logger,
            userNamingStrategy: 'strip-domain-email',
            groupNamingStrategy: 'kebab-case-name',
          });

        provider.setEntityProviderFactory(factory);
      },
    });
  },
});
```

This is your custom entity provider module. You can now add it to the backend in the `packages/backend/src/index.ts`
file:

```typescript
// We need to comment or remove the default entity provider, since now we have a custom one.
// backend.add(import('@roadiehq/catalog-backend-module-okta/org-provider-factory'));
backend.add(oktaOrgEntityProviderModule);
```

You can configure the provider with different naming strategies. The configured strategy will be used to generate the
discovered entity's `metadata.name` field. The currently supported strategies are the following:

#### User naming strategies

- id (default) | User entities will be named by the user id.
- kebab-case-email | User entities will be named by their profile email converted to kebab case.
- strip-domain-email | User entities will be named by their profile email without the domain part.

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customUserNamingStrategy: UserNamingStrategy = user =>
  user.profile.customField;
```

#### Group naming strategies

- id (default) | Group entities will be named by the group id.
- kebab-case-name | Group entities will be named by their group profile name converted to kebab case.
- profile-name | Group entities will be named exactly as their group profile name. ⚠ The Okta field supports characters
  not supported
  as [entity names in backstage](https://backstage.io/docs/features/software-catalog/descriptor-format#name-required). ⚠

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customGroupNamingStrategy: GroupNamingStrategy = group =>
  group.profile.customField;
```

#### Hierarchy config

You can optionally provide the ability to create a hierarchy of groups by providing `hierarchyConfig`.

```typescript
const factory: EntityProviderFactory = (oktaConfig: Config) =>
  OktaOrgEntityProvider.fromConfig(oktaConfig, {
    logger: logger,
    userNamingStrategy: 'strip-domain-email',
    groupNamingStrategy: 'kebab-case-name',
    hierarchyConfig: {
      key: 'profile.orgId',
      parentKey: 'profile.parentOrgId',
    },
  });
```

#### Custom Transformers

The module supports also custom transformers that can be configured as part of the customized registration.

In case you want to customize the emitted entities, the provider allows to pass custom transformers for users and groups
by providing `userTransformer` and `groupTransformer`.

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
const factory: EntityProviderFactory = (oktaConfig: Config) =>
  OktaOrgEntityProvider.fromConfig(oktaConfig, {
    logger: logger,
    userNamingStrategy: 'strip-domain-email',
    groupNamingStrategy: 'kebab-case-name',
    groupTransformer: myGroupTransformer,
  });
```

#### Legacy backend

<details>

<summary>Expand for example legacy configuration</summary>

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

  // ...snip...

  return router;
}
```

</details>

### Load Users and Groups Separately - OktaUserEntityProvider

You can construct your own configuration of OktaUserEntityProvider factory and register it into the backend:

```typescript
export const oktaUserEntityProviderModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'default-okta-user-entity-provider',
  register(env) {
    env.registerInit({
      deps: {
        provider: oktaCatalogBackendEntityProviderFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ provider, logger }) {
        const factory: EntityProviderFactory = (oktaConfig: Config) =>
          OktaUserEntityProvider.fromConfig(oktaConfig, {
            logger: logger,
            namingStrategy: 'strip-domain-email',
          });

        provider.setEntityProviderFactory(factory);
      },
    });
  },
});

// ...snip...

backend.add(oktaUserEntityProviderModule);
```

You can configure the provider with different naming strategies. The configured strategy will be used to generate the
discovered entity's `metadata.name` field. The currently supported strategies are the following:

- id (default) | User entities will be named by the user id.
- kebab-case-email | User entities will be named by their profile email converted to kebab case.
- strip-domain-email | User entities will be named by their profile email without the domain part.

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customUserNamingStrategy: UserNamingStrategy = user =>
  user.profile.customField;
```

In case you want to customize the emitted entities, the provider allows to pass custom transformer by providing
`userTransformer`.

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
const factory: EntityProviderFactory = (oktaConfig: Config) =>
    OktaUserEntityProvider.fromConfig(oktaConfig, {
        logger: logger,
        userNamingStrategy: 'strip-domain-email',
        groupNamingStrategy: 'kebab-case-name',
        groupTransformer: myUserTransformer,
    });
}
```

### Load Users and Groups Separately - OktaGroupEntityProvider

You can manually construct your own configuration of OktaGroupEntityProvider factory and register it into the backend:

```typescript
export const oktaGroupEntityProviderModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'default-okta-group-entity-provider',
  register(env) {
    env.registerInit({
      deps: {
        provider: oktaCatalogBackendEntityProviderFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ provider, logger }) {
        const factory: EntityProviderFactory = (oktaConfig: Config) =>
          OktaGroupEntityProvider.fromConfig(oktaConfig, {
            logger: logger,
            userNamingStrategy: 'strip-domain-email',
            namingStrategy: 'kebab-case-name',
          });

        provider.setEntityProviderFactory(factory);
      },
    });
  },
});
```

You can configure the provider with different naming strategies. The configured strategy will be used to generate the
discovered entities `metadata.name` field. The currently supported strategies are the following:

User naming strategies:

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
- profile-name | Group entities will be named exactly as their group profile name. ⚠ The Okta field supports characters
  not supported
  as [entity names in backstage](https://backstage.io/docs/features/software-catalog/descriptor-format#name-required). ⚠

You may also choose to implement a custom naming strategy by providing a function.

```typescript jsx
export const customGroupNamingStrategy: GroupNamingStrategy = group =>
  group.profile.customField;
```

Make sure you use the OktaUserEntityProvider's naming strategy for the OktaGroupEntityProvider's user naming strategy.

You can optionally provide the ability to create a hierarchy of groups by providing the `hierarchyConfig`. See example
of OrgEntityProvider above for usage instructions.

In case you want to customize the emitted entities, the provider allows to pass custom transformer by providing
`groupTransformer`.

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
export const oktaGroupEntityProviderModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'default-okta-group-entity-provider',
  register(env) {
    env.registerInit({
      deps: {
        provider: oktaCatalogBackendEntityProviderFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ provider, logger }) {
        const factory: EntityProviderFactory = (oktaConfig: Config) =>
          OktaGroupEntityProvider.fromConfig(oktaConfig, {
            logger: logger,
            userNamingStrategy: 'strip-domain-email',
            namingStrategy: 'kebab-case-name',
            groupTransformer: myGroupTransformer,
          });

        provider.setEntityProviderFactory(factory);
      },
    });
  },
});
```

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more
here: [https://roadie.io](https://roadie.io).
