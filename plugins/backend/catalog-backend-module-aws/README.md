# Catalog Backend Module for AWS

This is an extension module to the plugin-catalog-backend plugin, providing
entity providers to read AWS objects as Backstage Entities.

You will need to configure the providers in your catalog.ts file in your backstage backend:

```typescript
import {
  AWSEC2Provider,
  AWSIAMUserProvider,
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
} from '@roadiehq/catalog-backend-module-aws';

const AWSProviders = [
  AWSEC2Provider,
  AWSIAMUserProvider,
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
];

export default createBackendModule({
  moduleId: 'catalog-aws',
  pluginId: 'catalog',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        rootConfig: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, rootConfig, logger, scheduler }) {
        const config = rootConfig.getConfigArray('catalog.providers.aws');
        for (const accountConfig of config) {
          catalog.addEntityProvider(
            AWSEC2Provider.fromConfig(accountConfig, {
              logger,
              scheduler,
            }),
          );
          catalog.addEntityProvider(
            AWSIAMUserProvider.fromConfig(accountConfig, {
              logger,
              scheduler,
            }),
          );
          catalog.addEntityProvider(
            AWSLambdaFunctionProvider.fromConfig(accountConfig, {
              logger,
              scheduler,
            }),
          );
          catalog.addEntityProvider(
            AWSS3BucketProvider.fromConfig(accountConfig, {
              logger,
              scheduler,
            }),
          );
        }
      },
    });
  },
});
```

## Legacy Backend

If you are using the legacy backend, you can register the providers like this:

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
