# Catalog Backend Module for AWS

This is an extension module to the plugin-catalog-backend plugin, providing
entity providers to read AWS objects as Backstage Entities.

You will need to configure the providers in your catalog.ts file in your backstage backend:

```typescript
import {
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
  AWSIAMUserProvider,
  AWSEC2Provider,
} from '@roadiehq/catalog-backend-module-aws';

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

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
