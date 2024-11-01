# Catalog Backend Module for AWS

This is an extension module to the plugin-catalog-backend plugin, providing
entity providers to read AWS objects as Backstage Entities.

## Installation

Add the module package as backend dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @roadiehq/catalog-backend-module-aws
```

### New backend system

This backend plugin supports the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts`, Add the collator to your backend instance, along with the search plugin itself:

```diff
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
+ backend.add(import('@roadiehq/catalog-backend-module-aws/alpha'));
backend.start();
```

### Legacy backend system

Configure the providers in your catalog.ts file in your backstage backend:

```typescript
import {
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
  AWSIAMUserProvider,
  AWSEC2Provider,
} from '@internal/catalog-backend-module-aws';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  const s3Provider = AWSS3BucketProvider.fromConfig(config, env);
  const lambdaProvider = AWSLambdaFunctionProvider.fromConfig(config, env);
  const iamUserProvider = AWSIAMUserProvider.fromConfig(config, env);
  const ec2Provider = AWSEC2Provider.fromConfig(config, env);
  const awsAccountsProvider = AWSOrganizationAccountsProvider.fromConfig(
    config,
    env,
  );

  builder.addEntityProvider(s3Provider);
  builder.addEntityProvider(lambdaProvider);
  builder.addEntityProvider(iamUserProvider);
  builder.addEntityProvider(ec2Provider);
  builder.addEntityProvider(awsAccountsProvider);

  s3Provider.run();
  lambdaProvider.run();
  iamUserProvider.run();
  ec2Provider.run();
  awsAccountsProvider.run();

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  // ...

  return router;
}
```

## Configuration

The plugin is coupled to the [@backstage/integration-aws-node](https://github.com/backstage/backstage/tree/master/packages/integration-aws-node) plugin. It only adds the `aws.accounts[].schedule` allowing to configure different collection periods on per account basis.

```yaml
aws:
  accounts:
    - accountId: '123456789012' # Must have quotes to avoid bad interpretation as integer
    - accountId: '210987654321'
      schedule:
        frequency: { hours: 2 }
        timeout: { seconds: 45 }
        initialDelay: { seconds: 15 }
```

Similarly, the AWS Organization configuration uses the same specification as [@backstage/plugin-catalog-backend-module-aws](https://github.com/backstage/backstage/blob/master/plugins/catalog-backend-module-aws/README.md) plugin.

```yaml
catalog:
  processors:
    awsOragnization:
      provider:
        accountId: '123456789012'
```

Checkout the [config.d.ts](./config.d.ts) for more options.

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
